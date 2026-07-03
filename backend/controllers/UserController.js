const fs = require('fs');
const pool = require('../config/db');
const upload = require('../config/upload');
const { respondData, respondBadRequest } = require('../utils/response');

const PROFILE_QUERY = `
  SELECT u.id, u.email, u.is_active, u.photo_profil, u.created_at,
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
  WHERE u.id = ?
`;

function formatProfileRow(user) {
  if (!user) return null;
  user.photo_profil = user.photo_profil || user.tech_photo || null;
  user.roles = [user.role];
  delete user.tech_photo;
  return user;
}

async function fetchProfile(userId) {
  const [rows] = await pool.execute(PROFILE_QUERY, [userId]);
  return formatProfileRow(rows[0] || null);
}

exports.getProfile = async (req, res, next) => {
  try {
    const user = await fetchProfile(req.user.id);
    respondData(res, { user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { nom, prenom, telephone, adresse, specialite } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'technicien') {
      const techFields = [];
      const techParams = [];
      if (nom !== undefined) { techFields.push('nom = ?'); techParams.push(nom); }
      if (prenom !== undefined) { techFields.push('prenom = ?'); techParams.push(prenom); }
      if (telephone !== undefined) { techFields.push('telephone = ?'); techParams.push(telephone); }
      if (specialite !== undefined) { techFields.push('specialite = ?'); techParams.push(specialite); }
      if (techFields.length) {
        techParams.push(userId);
        await pool.execute(`UPDATE techniciens SET ${techFields.join(', ')} WHERE user_id = ?`, techParams);
      }
    } else if (role === 'admin') {
      if (nom !== undefined) {
        await pool.execute('UPDATE administrateurs SET nom = ? WHERE user_id = ?', [nom, userId]);
      }
      if (prenom !== undefined || telephone !== undefined || adresse !== undefined) {
        await pool.execute(
          `UPDATE clients SET nom = COALESCE(?, nom), prenom = COALESCE(?, prenom),
           telephone = COALESCE(?, telephone), adresse = COALESCE(?, adresse)
           WHERE user_id = ?`,
          [nom || null, prenom || null, telephone || null, adresse || null, userId]
        );
      }
    } else {
      await pool.execute(
        `UPDATE clients SET nom = COALESCE(?, nom), prenom = COALESCE(?, prenom),
         telephone = COALESCE(?, telephone), adresse = COALESCE(?, adresse)
         WHERE user_id = ?`,
        [nom || null, prenom || null, telephone || null, adresse || null, userId]
      );
    }

    const user = await fetchProfile(userId);
    respondData(res, { user }, 'Profil mis à jour');
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return respondBadRequest(res, 'Aucun fichier fourni');

    const isValid = await upload.verifyImageMime(req.file.path);
    if (!isValid) {
      fs.unlink(req.file.path, () => {});
      return respondBadRequest(res, 'Type de fichier non autorisé (images uniquement)');
    }

    await pool.execute('UPDATE users SET photo_profil = ? WHERE id = ?', [req.file.filename, req.user.id]);

    const profile = await fetchProfile(req.user.id);
    if (profile?.role === 'technicien') {
      await pool.execute(
        'UPDATE techniciens SET photo_profil = ? WHERE user_id = ?',
        [req.file.filename, req.user.id]
      );
    }

    const user = await fetchProfile(req.user.id);
    respondData(res, { user }, 'Photo mise à jour');
  } catch (error) {
    next(error);
  }
};
