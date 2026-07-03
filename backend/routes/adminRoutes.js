const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/AdministrateurController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { createAdminRules } = require('../validations/adminValidator');
const { validate } = require('../validations/authValidator');

const adminCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Trop de tentatives de création, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect, authorize('admin'));

router.get('/demandes/list', adminController.listDemandes);
router.post('/demandes/:id/approve', adminController.approveDemande);
router.post('/demandes/:id/reject', adminController.rejectDemande);

router.get('/', adminController.list);
router.post('/', adminCreateLimiter, createAdminRules, validate, adminController.create);
router.get('/:id', adminController.getById);
router.put('/:id', adminController.update);
router.delete('/:id', adminController.delete);

module.exports = router;
