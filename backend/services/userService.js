const pool = require('../config/db');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

const NAME_PATTERN = /^[a-zA-ZÀ-ÿa-zA-Z\s\-']+$/;
const TELEPHONE_PATTERN = /^[+\d][\d\s\-().]{6,20}$/;

const validatePassword = (password) => {
  if (!password || password.length < 8) throw new AppError('Le mot de passe doit contenir au moins 8 caractères', 400);
  if (password.length > 128) throw new AppError('Le mot de passe ne doit pas dépasser 128 caractères', 400);
  if (!/[A-Z]/.test(password)) throw new AppError('Le mot de passe doit contenir une majuscule', 400);
  if (!/[0-9]/.test(password)) throw new AppError('Le mot de passe doit contenir un chiffre', 400);
  if (!/[^A-Za-z0-9]/.test(password)) throw new AppError('Le mot de passe doit contenir un caractère spécial', 400);
};

const userService = {
  async list(Model, limit = null, offset = 0) {
    return await Model.findAll(limit, offset);
  },

  async getById(Model, id) {
    return await Model.findById(id);
  },

  async update(Model, id, body, roleLabel) {
    const existing = await Model.findById(id);
    if (!existing) {
      throw new AppError(`${roleLabel} introuvable`, 404);
    }
    const updated = await Model.update(id, body);
    if (body.email) {
      await pool.execute('UPDATE users SET email = ? WHERE id = ?', [body.email, existing.user_id]);
    }
    if (body.password) {
      const password_hash = await bcrypt.hash(body.password, 12);
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, existing.user_id]);
    }
    return updated;
  },

  async delete(Model, id, roleLabel) {
    const existing = await Model.findById(id);
    if (!existing) {
      throw new AppError(`${roleLabel} introuvable`, 404);
    }
    if (existing.is_active === 0) {
      throw new AppError(`${roleLabel} est déjà désactivé`, 400);
    }
    await pool.execute('UPDATE users SET is_active = 0, email = CONCAT("deleted_", id, "_", email) WHERE id = ?', [existing.user_id]);
    return true;
  },

  async createAdmin(data) {
    const { nom, email, password } = data;
    if (!nom || !email || !password) {
      throw new AppError('Nom, email et mot de passe requis', 400);
    }
    if (!NAME_PATTERN.test(nom)) {
      throw new AppError('Le nom contient des caractères non autorisés', 400);
    }
    if (nom.length > 100) {
      throw new AppError('Le nom ne doit pas dépasser 100 caractères', 400);
    }
    validatePassword(password);
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }
    const password_hash = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const userId = await UserModel.createUser(conn, { email, password_hash });
      await conn.execute(
        'INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)',
        [userId, nom]
      );
      await conn.commit();
      return userId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async createTechnicien(data) {
    const { nom, prenom, email, password, telephone, adresse, specialite, piece_identite, photo_profil } = data;
    if (!nom || !prenom || !email || !password || !specialite) {
      throw new AppError('Nom, prénom, email, mot de passe et spécialité requis', 400);
    }
    if (!NAME_PATTERN.test(nom) || !NAME_PATTERN.test(prenom)) {
      throw new AppError('Le nom ou le prénom contient des caractères non autorisés', 400);
    }
    if (nom.length > 100 || prenom.length > 100) {
      throw new AppError('Le nom ou le prénom ne doit pas dépasser 100 caractères', 400);
    }
    if (telephone && !TELEPHONE_PATTERN.test(telephone)) {
      throw new AppError('Format de téléphone invalide', 400);
    }
    if (adresse && adresse.length > 255) {
      throw new AppError('L\'adresse ne doit pas dépasser 255 caractères', 400);
    }
    validatePassword(password);
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }
    const password_hash = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const userId = await UserModel.createUser(conn, { email, password_hash });
      await conn.execute(
        `INSERT INTO techniciens (user_id, nom, prenom, telephone, adresse, specialite, piece_identite, photo_profil, est_verifie)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [userId, nom, prenom, telephone || null, adresse || null, specialite, piece_identite || null, photo_profil || null]
      );
      await conn.commit();
      return userId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = userService;
