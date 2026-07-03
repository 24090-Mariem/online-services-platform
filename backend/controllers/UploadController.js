const fs = require('fs');
const path = require('path');
const upload = require('../config/upload');
const { respondMessage, respondBadRequest, respondNotFound } = require('../utils/response');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return respondBadRequest(res, 'Aucun fichier fourni');
    respondMessage(res, 'Fichier uploadé avec succès', 201, {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.servePrivate = async (req, res, next) => {
  try {
    const storedPath = req.params.filename.includes('/')
      ? req.params.filename
      : `private/${req.params.filename}`;

    const filePath = upload.resolveUploadPath(storedPath);
    if (!filePath || !filePath.startsWith(upload.uploadsDir) || !fs.existsSync(filePath)) {
      return respondNotFound(res, 'Fichier introuvable');
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
};
