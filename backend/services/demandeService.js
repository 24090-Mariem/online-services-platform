const crypto = require('crypto');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

const demandeService = {
  async list() {
    const [rows] = await pool.execute(
      `SELECT * FROM demandes_techniciens ORDER BY date_demande DESC`
    );
    return rows;
  },

  async submit(data) {
    const { nom, prenom, email, telephone, specialite, piece_identite, diplome, photo_profil } = data;
    if (!nom || !email || !specialite) {
      throw new AppError('Nom, email et spécialité requis', 400);
    }
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const password_hash = await bcrypt.hash(tempPassword, 12);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const userId = await UserModel.createUser(conn, { email, password_hash });
      await conn.execute(
        `INSERT INTO demandes_techniciens (user_id, nom, prenom, email, telephone, specialite, piece_identite, photo_profil, diplome, statut)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'EN_ATTENTE')`,
        [userId, nom, prenom || null, email, telephone || null, specialite, piece_identite || null, photo_profil || null, diplome || null]
      );
      await conn.commit();
      return { userId, tempPassword };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async approve(id, adminId, commentaireAdmin) {
    const demande = await this._findDemande(id);
    if (!demande) throw new AppError('Demande introuvable', 404);
    if (demande.statut !== 'EN_ATTENTE') {
      throw new AppError('Cette demande a déjà été traitée', 400);
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const clientExists = await this._checkClientExists(conn, demande.user_id);
      await conn.execute(
        'INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, piece_identite, photo_profil, est_verifie) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [demande.user_id, demande.nom, demande.prenom || '', demande.telephone || null, demande.specialite, demande.piece_identite, demande.photo_profil]
      );
      if (clientExists) {
        await conn.execute('DELETE FROM clients WHERE user_id = ?', [demande.user_id]);
      }
      await conn.execute(
        "UPDATE demandes_techniciens SET statut = 'APPROUVE', commentaire_admin = ? WHERE id = ?",
        [commentaireAdmin || null, id]
      );
      await conn.commit();
      return { isExistingClient: clientExists };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
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

  async _findDemande(id) {
    const [rows] = await pool.execute('SELECT * FROM demandes_techniciens WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async _checkClientExists(conn, userId) {
    const [rows] = await conn.execute('SELECT id FROM clients WHERE user_id = ?', [userId]);
    return rows.length > 0;
  },
};

module.exports = demandeService;
