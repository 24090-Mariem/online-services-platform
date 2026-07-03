const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/UploadController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

router.post('/', protect, upload.single('file'), async (req, res, next) => {
  if (req.file) {
    const isValid = await upload.verifyMime(req.file.path);
    if (!isValid) {
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'Type de fichier non autorisé' });
    }
  }
  next();
}, uploadController.upload);

router.get('/private/:filename', protect, authorize('admin'), uploadController.servePrivate);

module.exports = router;
