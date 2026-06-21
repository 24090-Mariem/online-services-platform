const crypto = require('crypto');

const COOKIE_NAME = 'csrf_token';
const HEADER_NAME = 'x-csrf-token';

const csrfProtection = (req, res, next) => {
  if (process.env.CSRF_ENABLED !== 'true') {
    return next();
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies[COOKIE_NAME]) {
      res.cookie(COOKIE_NAME, crypto.randomBytes(32).toString('hex'), {
        httpOnly: false,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    return next();
  }

  const cookieToken = req.cookies[COOKIE_NAME];
  const headerToken = req.headers[HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token invalide',
    });
  }

  next();
};

module.exports = csrfProtection;
