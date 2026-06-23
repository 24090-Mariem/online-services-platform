const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const pool = require('../config/db');
const upload = require('../config/upload');
const { respondData, respondMessage } = require('../utils/response');

router.use(protect);

router.get('/profile', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.is_active, u.photo_profil, u.created_at,
              cl.nom, cl.prenom, cl.telephone, cl.adresse,
              t.specialite, t.photo_profil AS tech_photo, t.score, t.badge,
              a.nom AS admin_nom,
              CASE
                WHEN a.id IS NOT NULL THEN 'admin'
                WHEN t.id IS NOT NULL THEN 'technicien'
                ELSE 'client'
              END AS role
       FROM users u
       LEFT JOIN clients cl ON cl.user_id = u.id
       LEFT JOIN techniciens t ON t.user_id = u.id
       LEFT JOIN administrateurs a ON a.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    const user = rows[0];
    if (user) {
      user.photo_profil = user.photo_profil || user.tech_photo || null;
      user.roles = [user.role];
      delete user.tech_photo;
    }
    respondData(res, { user });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const { nom, prenom, telephone, adresse, specialite } = req.body;
    const userId = req.user.id;

    await pool.execute(
      `UPDATE clients SET nom = COALESCE(?, nom), prenom = COALESCE(?, prenom),
       telephone = COALESCE(?, telephone), adresse = COALESCE(?, adresse)
       WHERE user_id = ?`,
      [nom || null, prenom || null, telephone || null, adresse || null, userId]
    );

    if (specialite) {
      await pool.execute(
        'UPDATE techniciens SET specialite = ? WHERE user_id = ?',
        [specialite, userId]
      );
    }

    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.is_active, u.photo_profil,
              cl.nom, cl.prenom, cl.telephone, cl.adresse,
              t.specialite, t.photo_profil AS tech_photo, t.score, t.badge,
              CASE
                WHEN a.id IS NOT NULL THEN 'admin'
                WHEN t.id IS NOT NULL THEN 'technicien'
                ELSE 'client'
              END AS role
       FROM users u
       LEFT JOIN clients cl ON cl.user_id = u.id
       LEFT JOIN techniciens t ON t.user_id = u.id
       LEFT JOIN administrateurs a ON a.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    const user = rows[0];
    if (user) {
      user.photo_profil = user.photo_profil || user.tech_photo || null;
      user.roles = [user.role];
      delete user.tech_photo;
    }
    respondData(res, { user }, 'Profil mis à jour');
  } catch (error) {
    next(error);
  }
});

router.post('/profile/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }
    const filename = req.file.filename;
    await pool.execute('UPDATE users SET photo_profil = ? WHERE id = ?', [filename, req.user.id]);
    respondData(res, { photo_profil: filename }, 'Photo mise à jour');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
