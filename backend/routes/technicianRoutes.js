const express = require('express');
const router = express.Router();
const technicienController = require('../controllers/TechnicienController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

router.get('/public', technicienController.listPublic);
router.get('/public/:id', technicienController.getPublicProfile);
router.get('/search', technicienController.search);

router.post('/demande', upload.fields([
  { name: 'piece_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'photo_profil', maxCount: 1 }
]), technicienController.submitDemande);

router.use(protect, authorize('admin'));

router.get('/', technicienController.list);
router.post('/', upload.fields([
  { name: 'piece_identite', maxCount: 1 },
  { name: 'photo_profil', maxCount: 1 }
]), technicienController.create);
router.get('/:id', technicienController.getById);
router.put('/:id', technicienController.update);
router.delete('/:id', technicienController.delete);

module.exports = router;
