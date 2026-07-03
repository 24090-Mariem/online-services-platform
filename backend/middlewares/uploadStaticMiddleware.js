const path = require('path');
const express = require('express');

const PUBLIC_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const staticHandler = express.static(uploadsRoot, { fallthrough: false });

const uploadStaticMiddleware = (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (!PUBLIC_EXTENSIONS.has(ext)) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }
  return staticHandler(req, res, next);
};

module.exports = uploadStaticMiddleware;
