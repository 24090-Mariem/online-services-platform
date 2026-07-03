const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const PasswordResetModel = require('../models/PasswordResetModel');
const { signAccessToken, sanitizeUser } = require('../utils/jwt');
const tokenStore = require('../utils/tokenStore');
const AppError = require('../utils/AppError');
const pool = require('../config/db');
const { sendPasswordResetEmail } = require('./emailService');

const AuthService = {
  async register({ email, password, nom, prenom, telephone }) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        throw new AppError('Cet email est déjà utilisé', 409);
      }

      const password_hash = await bcrypt.hash(password, 12);

      const userId = await UserModel.createUser(conn, {
        email,
        password_hash,
      });

      await UserModel.createClientProfile(conn, {
        user_id: userId,
        nom,
        prenom,
        telephone,
      });

      await conn.commit();

       
      const user = await UserModel.findById(userId);

      const accessToken = signAccessToken({
        id: user.id,
        role: user.role,
      });

      const refreshToken = await tokenStore.store(user.id);

      return {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async login(email, password) {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (user.is_active === 0) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    await UserModel.updateLastLogin(user.id);

    const fullUser = await UserModel.findById(user.id);

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = await tokenStore.store(user.id);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(fullUser),
    };
  },

  async refresh(refreshToken) {
    const userId = await tokenStore.verify(refreshToken);

    if (!userId) {
      throw new AppError('Session expirée, veuillez vous reconnecter', 401);
    }

    await tokenStore.revoke(refreshToken);

    const user = await UserModel.findById(userId);

    if (!user || user.is_active === 0) {
      throw new AppError('Compte non disponible', 401);
    }

    const newAccessToken = signAccessToken({
      id: user.id,
      role: user.role,
    });

    const newRefreshToken = await tokenStore.store(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user),
    };
  },

  async logout(userId) {
    await tokenStore.revokeAllForUser(userId);
  },

  async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user || user.is_active === 0) {
      throw new AppError('Session expirée, veuillez vous reconnecter', 401);
    }
    return sanitizeUser(user);
  },

  async forgotPassword(email) {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    await PasswordResetModel.deleteAllForUser(user.id);
    const token = await PasswordResetModel.create(user.id);

    await sendPasswordResetEmail(email, token).catch(err => {
      console.error('[Email] Erreur envoi:', err.message);
    });

    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
  },

  async resetPassword(token, newPassword) {
    const record = await PasswordResetModel.findByToken(token);

    if (!record) {
      throw new AppError('Lien invalide ou expiré', 400);
    }

    const password_hash = await bcrypt.hash(newPassword, 12);

    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, record.user_id]);
    await PasswordResetModel.delete(record.id);
    await tokenStore.revokeAllForUser(record.user_id);
  },
};

module.exports = AuthService;