const { verifyAccessToken, clearAuthCookies } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const UserModel = require('../models/UserModel');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return sendError(res, 'Non authentifié', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      clearAuthCookies(res);
      return sendError(res, 'Utilisateur non trouvé', 401);
    }

    if (user.is_active === 0) {
      clearAuthCookies(res);
      return sendError(res, 'Compte désactivé', 403);
    }

    req.user = { id: user.id, user_id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    clearAuthCookies(res);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 'Token invalide ou expiré', 401);
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Non authentifié', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Accès non autorisé', 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
