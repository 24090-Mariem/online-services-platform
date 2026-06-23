const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const RoleMiddleware = require('../middlewares/roleMiddleware');
const ReviewController = require('../controllers/ReviewController');
const { createReviewValidation, updateReviewValidation } = require('../validations/reviewValidators');

router.get('/', ReviewController.findAll);
router.get('/technicien/:id', ReviewController.findByTechnicien);
router.get('/:id', ReviewController.findById);
router.post('/', protect, RoleMiddleware('client'), createReviewValidation, ReviewController.create);
router.put('/:id', protect, updateReviewValidation, ReviewController.update);
router.delete('/:id', protect, ReviewController.delete);

module.exports = router;
