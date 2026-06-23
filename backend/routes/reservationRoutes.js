const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const RoleMiddleware = require('../middlewares/roleMiddleware');
const ReservationController = require('../controllers/ReservationController');

router.get('/mine', protect, RoleMiddleware('client'), ReservationController.mine);
router.get('/technicien', protect, RoleMiddleware('technicien'), ReservationController.technicienReservations);
router.get('/user/:userId', protect, RoleMiddleware('admin'), ReservationController.findByUser);
router.post('/', protect, RoleMiddleware('client'), ReservationController.create);
router.put('/:id/accept', protect, RoleMiddleware('technicien'), ReservationController.accept);
router.put('/:id/reject', protect, RoleMiddleware('technicien'), ReservationController.reject);
router.put('/:id/complete', protect, RoleMiddleware('technicien'), ReservationController.complete);

module.exports = router;
