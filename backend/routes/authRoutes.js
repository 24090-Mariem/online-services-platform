const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const {
  register, login, refresh, logout, getMe, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, validate } = require('../validations/authValidator');
const { protect } = require('../middlewares/authMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Trop de tentatives' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', generalLimiter, protect, logout);
router.get('/me', generalLimiter, protect, getMe);
router.post('/forgot-password', forgotLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetLimiter, resetPasswordRules, validate, resetPassword);

module.exports = router;
