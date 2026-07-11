const AuthService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const { sendAccessTokenCookie, sendRefreshTokenCookie, clearAuthCookies } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, nom, prenom, telephone } = req.body;
    const { accessToken, refreshToken, user } = await AuthService.register({
      email, password, nom, prenom, telephone,
    });

    sendAccessTokenCookie(res, accessToken);
    sendRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { user }, 'Inscription réussie', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await AuthService.login(email, password);

    sendAccessTokenCookie(res, accessToken);
    sendRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { user, token: accessToken }, 'Connexion réussie');
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return sendError(res, 'Non authentifié', 401);
    }
    const { accessToken, refreshToken: newRefreshToken, user } = await AuthService.refresh(refreshToken);

    sendAccessTokenCookie(res, accessToken);
    sendRefreshTokenCookie(res, newRefreshToken);
    sendSuccess(res, { user }, 'Token rafraîchi');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.user.id);
    clearAuthCookies(res);
    sendSuccess(res, null, 'Déconnexion réussie');
  } catch (error) {
    console.error('[Logout] Erreur révocations tokens:', error.message);
    clearAuthCookies(res);
    sendSuccess(res, null, 'Déconnexion réussie');
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.user.id);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    sendSuccess(res, null, 'Mot de passe réinitialisé avec succès');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getMe, forgotPassword, resetPassword };
