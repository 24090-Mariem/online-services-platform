const { Router } = require('express');
const {
  authLimiter,
  refreshLimiter,
  forgotLimiter,
  resetLimiter,
  generalLimiter,
} = require('../middlewares/rateLimiter');
const {
  register, login, refresh, logout, getMe, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, validate } = require('../validations/authValidator');
const { protect } = require('../middlewares/authMiddleware');
const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', generalLimiter, protect, logout);
router.get('/me', generalLimiter, protect, getMe);
router.post('/forgot-password', forgotLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetLimiter, resetPasswordRules, validate, resetPassword);

module.exports = router;
