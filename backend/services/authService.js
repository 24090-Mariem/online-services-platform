const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const PasswordResetModel = require('../models/PasswordResetModel');
const { signAccessToken, sanitizeUser } = require('../utils/jwt');
const tokenStore = require('../utils/tokenStore');
const AppError = require('../utils/AppError');
const pool = require('../config/db');
const { sendPasswordResetEmail } = require('./emailService');
const { validatePassword, NAME_PATTERN, TELEPHONE_PATTERN } = require('./userService');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthService = {
  async register({ email, password, nom, prenom, telephone }) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      if (!email || !EMAIL_PATTERN.test(email)) {
        throw new AppError('Format d\'email invalide', 400);
      }
      if (!nom || nom.length < 1 || nom.length > 100 || !NAME_PATTERN.test(nom)) {
        throw new AppError('Le nom est invalide (1-100 caractères, lettres uniquement)', 400);
      }
      if (prenom && (prenom.length > 100 || !NAME_PATTERN.test(prenom))) {
        throw new AppError('Le prénom est invalide (max 100 caractères, lettres uniquement)', 400);
      }
      if (telephone && !TELEPHONE_PATTERN.test(telephone)) {
        throw new AppError('Format de téléphone invalide', 400);
      }
      validatePassword(password);

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

      const { raw: refreshToken } = await tokenStore.store(user.id);

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

    const accessToken = signAccessToken({ id: fullUser.id, role: fullUser.role });
    const { raw: refreshToken } = await tokenStore.store(fullUser.id);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(fullUser),
    };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Non authentifié', 401);
    }

    const tokenData = await tokenStore.verify(refreshToken);

    if (!tokenData) {
      throw new AppError('Session expirée, veuillez vous reconnecter', 401);
    }

    const { userId, familyId } = tokenData;

    await tokenStore.revoke(refreshToken);

    const user = await UserModel.findById(userId);

    if (!user || user.is_active === 0) {
      throw new AppError('Compte non disponible', 401);
    }

    const newAccessToken = signAccessToken({
      id: user.id,
      role: user.role,
    });

    const { raw: newRefreshToken } = await tokenStore.store(user.id, 7 * 24 * 60 * 60 * 1000, familyId);

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
    if (!user) {
      throw new AppError('Session expirée, veuillez vous reconnecter', 401);
    }
    if (user.is_active === 0) {
      throw new AppError('Compte désactivé', 403);
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
      console.error('[Email] Erreur envoi reset password pour', user.id, ':', err.message);
    });

    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
  },

  async resetPassword(token, newPassword) {
    const record = await PasswordResetModel.findByToken(token);

    if (!record) {
      throw new AppError('Lien invalide ou expiré', 400);
    }

    const password_hash = await bcrypt.hash(newPassword, 12);

    await pool.execute('UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?', [password_hash, record.user_id]);
    await PasswordResetModel.delete(record.id);
    await tokenStore.revokeAllForUser(record.user_id);
  },
};

module.exports = AuthService;