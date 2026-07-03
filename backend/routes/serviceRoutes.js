const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ServiceController = require('../controllers/ServiceController');
const upload = require('../config/upload');

router.get('/', ServiceController.listPublic);
router.get('/mine', protect, authorize('technicien'), ServiceController.mine);
router.post('/', protect, authorize('technicien'), upload.single('image'), ServiceController.create);
router.put('/:id', protect, authorize('technicien'), upload.single('image'), ServiceController.update);
router.delete('/:id', protect, authorize('technicien'), ServiceController.delete);

router.get('/all', protect, authorize('admin'), ServiceController.listAll);
router.put('/:id/toggle', protect, authorize('admin'), ServiceController.toggleActive);

module.exports = router;
