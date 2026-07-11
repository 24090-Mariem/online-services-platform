const crypto = require('crypto');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');
const PasswordResetModel = require('../models/PasswordResetModel');
const { sendDemandeConfirmation, sendWelcomeWithLink } = require('./emailService');

const NAME_PATTERN = /^[\p{L}\s\-']+$/u;

const demandeService = {
  async list(limit = null, offset = 0) {
    let sql = `SELECT * FROM demandes_techniciens ORDER BY date_demande DESC`;
    const params = [];
    if (limit != null) {
      const n = Number(limit);
      if (!Number.isInteger(n) || n < 1) throw new Error('LIMIT must be a positive integer');
      const clamped = Math.min(n, 100);
      sql += ` LIMIT ?`;
      params.push(clamped);
    }
    if (offset != null) {
      const n = Number(offset);
      if (!Number.isInteger(n) || n < 0) throw new Error('OFFSET must be a non-negative integer');
      if (n > 0) {
        sql += ` OFFSET ?`;
        params.push(n);
      }
    }
    const [rows] = params.length > 0 ? await pool.query(sql, params) : await pool.execute(sql);
    return rows;
  },

  async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM demandes_techniciens');
    return rows[0].total;
  },

  async submit(data) {
    const { nom, prenom, email, telephone, specialite, piece_identite, diplome, photo_profil } = data;
    if (!nom || !prenom || !email || !specialite) {
      throw new AppError('Nom, prénom, email et spécialité requis', 400);
    }
    if (!NAME_PATTERN.test(nom) || !NAME_PATTERN.test(prenom)) {
      throw new AppError('Le nom ou le prénom contient des caractères non autorisés', 400);
    }
    if (nom.length > 100 || prenom.length > 100) {
      throw new AppError('Le nom ou le prénom ne doit pas dépasser 100 caractères', 400);
    }
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }
    const password_hash = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 12);
    const conn = await pool.getConnection();
    let demandeId;
    try {
      await conn.beginTransaction();
      const userId = await UserModel.createUser(conn, { email, password_hash, is_active: 0 });
      const [demandeResult] = await conn.execute(
        `INSERT INTO demandes_techniciens (user_id, nom, prenom, email, telephone, specialite, piece_identite, photo_profil, diplome, statut)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'EN_ATTENTE')`,
        [userId, nom, prenom, email, telephone || null, specialite, piece_identite || null, photo_profil || null, diplome || null]
      );
      demandeId = demandeResult.insertId;
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    await sendDemandeConfirmation(email, nom, prenom).catch(err => {
      console.error('[Email] Erreur envoi demande confirmation pour', email, ':', err.message);
    });

    return { demandeId };
  },

  async approve(id, adminId, commentaireAdmin) {
    const demande = await this._findDemande(id);
    if (!demande) throw new AppError('Demande introuvable', 404);
    if (demande.statut !== 'EN_ATTENTE') {
      throw new AppError('Cette demande a déjà été traitée', 400);
    }
    const conn = await pool.getConnection();
    let token;
    try {
      await conn.beginTransaction();
      const [existing] = await conn.execute(
        'SELECT id FROM techniciens WHERE user_id = ?',
        [demande.user_id]
      );
      if (existing.length === 0) {
        await conn.execute(
          'INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, piece_identite, photo_profil, est_verifie) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
          [demande.user_id, demande.nom, demande.prenom || '', demande.telephone || null, demande.specialite, demande.piece_identite, demande.photo_profil]
        );
      }
      await conn.execute(
        "UPDATE demandes_techniciens SET statut = 'APPROUVE', commentaire_admin = ? WHERE id = ?",
        [commentaireAdmin || null, id]
      );

      await PasswordResetModel.deleteAllForUser(demande.user_id);
      token = await PasswordResetModel.create(demande.user_id, 24 * 60 * 60 * 1000);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const baseUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const setupLink = `${baseUrl}/set-password?token=${token}&email=${encodeURIComponent(demande.email)}`;

    let emailSent = true;
    await sendWelcomeWithLink(demande.email, demande.nom, demande.prenom, setupLink).catch(err => {
      console.error('[Email] Erreur envoi welcome link pour', demande.email, ':', err.message);
      emailSent = false;
    });

    return { emailSent, setupLink };
  },

  async reject(id, adminId, commentaireAdmin) {
    const demande = await this._findDemande(id);
    if (!demande) throw new AppError('Demande introuvable', 404);
    if (demande.statut !== 'EN_ATTENTE') {
      throw new AppError('Cette demande a déjà été traitée', 400);
    }
    await pool.execute(
      "UPDATE demandes_techniciens SET statut = 'REJETE', commentaire_admin = ? WHERE id = ?",
      [commentaireAdmin || null, id]
    );
    return true;
  },

  async findDemande(id) {
    const [rows] = await pool.execute('SELECT * FROM demandes_techniciens WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async _findDemande(id) {
    return this.findDemande(id);
  },
};

module.exports = demandeService;
