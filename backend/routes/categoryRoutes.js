const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/CategorieController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', categorieController.findAll);
router.get('/:id', categorieController.findById);

router.use(protect, authorize('admin'));

router.post('/', categorieController.create);
router.put('/:id', categorieController.update);
router.delete('/:id', categorieController.delete);

module.exports = router;
