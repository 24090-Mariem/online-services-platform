const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ReservationController = require('../controllers/ReservationController');

const { createReservationRules, validate } = require('../validations/reservationValidator');

router.get('/mine', protect, authorize('client'), ReservationController.mine);
router.get('/technicien', protect, authorize('technicien'), ReservationController.technicienReservations);
router.get('/user/:userId', protect, authorize('admin'), ReservationController.findByUser);
router.post('/', protect, authorize('client'), createReservationRules, validate, ReservationController.create);
router.put('/:id/accept', protect, authorize('technicien'), ReservationController.accept);
router.put('/:id/reject', protect, authorize('technicien'), ReservationController.reject);
router.put('/:id/complete', protect, authorize('technicien'), ReservationController.complete);

module.exports = router;
