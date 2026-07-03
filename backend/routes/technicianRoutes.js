const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const technicienController = require('../controllers/TechnicienController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');
const { createTechnicienRules, submitDemandeRules } = require('../validations/technicianValidator');
const { validate } = require('../validations/authValidator');

const demandeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Trop de demandes d\'inscription, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

const createTechnicienLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de création, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', technicienController.listPublic);
router.get('/public', technicienController.listPublic);
router.get('/public/:id', technicienController.getPublicProfile);
router.get('/search', technicienController.search);

router.post('/demande', demandeLimiter, upload.demandeUpload.fields([
  { name: 'piece_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'photo_profil', maxCount: 1 },
]), submitDemandeRules, validate, technicienController.submitDemande);

router.use(protect, authorize('admin'));

router.get('/all', technicienController.list);
router.post('/', createTechnicienLimiter, upload.fields([
  { name: 'piece_identite', maxCount: 1 },
  { name: 'photo_profil', maxCount: 1 }
]), createTechnicienRules, validate, technicienController.create);
router.get('/:id', technicienController.getById);
router.put('/:id', technicienController.update);
router.delete('/:id', technicienController.delete);

module.exports = router;
