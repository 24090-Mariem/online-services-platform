const jwt = require('jsonwebtoken');

const ACCESS_COOKIE = 'token';
const REFRESH_COOKIE = 'refresh_token';

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
};

const baseCookieOpts = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict',
  path: '/',
});

const sendAccessTokenCookie = (res, token) => {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseCookieOpts(),
    maxAge: 15 * 60 * 1000,
  });
};

const sendRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOpts(),
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  const opts = { ...baseCookieOpts(), maxAge: 0 };
  res.cookie(ACCESS_COOKIE, '', opts);
  res.cookie(REFRESH_COOKIE, '', { ...opts, path: '/api/auth' });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
};

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  signAccessToken,
  verifyAccessToken,
  sendAccessTokenCookie,
  sendRefreshTokenCookie,
  clearAuthCookies,
  sanitizeUser,
};
