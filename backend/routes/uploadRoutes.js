const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/UploadController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

router.post('/', protect, upload.single('file'), uploadController.upload);

module.exports = router;
