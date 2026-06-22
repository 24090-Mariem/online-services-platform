const pool = require('../config/db');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

const userService = {
  async list(Model) {
    return await Model.findAll();
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
    await pool.execute('DELETE FROM users WHERE id = ?', [existing.user_id]);
    return true;
  },

  async createAdmin(data) {
    const { nom, email, password } = data;
    if (!nom || !email || !password) {
      throw new AppError('Nom, email et mot de passe requis', 400);
    }
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
