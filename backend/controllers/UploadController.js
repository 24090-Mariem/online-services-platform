const path = require('path');
const { respondMessage, respondBadRequest } = require('../utils/response');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return respondBadRequest(res, 'Aucun fichier fourni');
    respondMessage(res, 'Fichier uploadé avec succès', 201, {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    next(error);
  }
};
