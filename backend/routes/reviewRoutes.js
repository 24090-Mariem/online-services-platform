const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ReviewController = require('../controllers/ReviewController');
const { createReviewValidation, updateReviewValidation } = require('../validations/reviewValidators');

router.get('/technicien/:id', ReviewController.findByTechnicien);
router.get('/client/mine', protect, authorize('client'), ReviewController.findMyReviews);
router.get('/', protect, authorize('admin'), ReviewController.findAll);
router.get('/:id', protect, ReviewController.findById);
router.post('/', protect, authorize('client'), createReviewValidation, ReviewController.create);
router.put('/:id', protect, updateReviewValidation, ReviewController.update);
router.delete('/:id', protect, ReviewController.delete);

module.exports = router;
