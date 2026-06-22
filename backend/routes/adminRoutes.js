const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdministrateurController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/', adminController.list);
router.post('/', adminController.create);
router.get('/:id', adminController.getById);
router.put('/:id', adminController.update);
router.delete('/:id', adminController.delete);
router.get('/demandes/list', adminController.listDemandes);
router.post('/demandes/:id/approve', adminController.approveDemande);
router.post('/demandes/:id/reject', adminController.rejectDemande);

module.exports = router;
