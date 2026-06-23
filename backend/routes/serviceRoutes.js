const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const RoleMiddleware = require('../middlewares/roleMiddleware');
const ServiceController = require('../controllers/ServiceController');
const upload = require('../config/upload');

router.get('/', ServiceController.listPublic);
router.get('/mine', protect, RoleMiddleware('technicien'), ServiceController.mine);
router.post('/', protect, RoleMiddleware('technicien'), upload.single('image'), ServiceController.create);
router.put('/:id', protect, RoleMiddleware('technicien'), upload.single('image'), ServiceController.update);
router.delete('/:id', protect, RoleMiddleware('technicien'), ServiceController.delete);

module.exports = router;
