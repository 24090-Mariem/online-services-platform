// DEPRECATED: Use authorize() from authMiddleware.js instead.
// Kept for reference - will be removed in a future cleanup.
const { respondForbidden } = require('../utils/response');

function RoleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return respondForbidden(res, 'Accès non autorisé');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return respondForbidden(res, 'Vous n\'avez pas les droits pour effectuer cette action');
    }
    next();
  };
}

module.exports = RoleMiddleware;
