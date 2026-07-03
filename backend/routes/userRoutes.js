const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const UserController = require('../controllers/UserController');
const upload = require('../config/upload');

router.use(protect);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/profile/avatar', upload.avatarUpload.single('avatar'), UserController.uploadAvatar);

module.exports = router;
