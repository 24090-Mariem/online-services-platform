const fs = require('fs');
const pool = require('../config/db');
const upload = require('../config/upload');
const UserModel = require('../models/UserModel');
const { validatePassword, NAME_PATTERN, TELEPHONE_PATTERN } = require('../services/userService');
const { respondData, respondBadRequest } = require('../utils/response');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROFILE_QUERY = `
  SELECT u.id, u.email, u.is_active, u.photo_profil, u.created_at,
         cl.nom, cl.prenom, cl.telephone, cl.adresse,
         t.specialite, t.photo_profil AS tech_photo, t.score, t.badge,
         a.nom AS admin_nom,
         CASE
           WHEN a.id IS NOT NULL THEN 'admin'
           WHEN t.id IS NOT NULL THEN 'technicien'
           ELSE 'client'
         END AS role,
         EXISTS(SELECT 1 FROM administrateurs WHERE user_id = u.id) AS is_admin,
         EXISTS(SELECT 1 FROM techniciens WHERE user_id = u.id) AS is_tech,
         EXISTS(SELECT 1 FROM clients WHERE user_id = u.id) AS is_client
  FROM users u
  LEFT JOIN clients cl ON cl.user_id = u.id
  LEFT JOIN techniciens t ON t.user_id = u.id
  LEFT JOIN administrateurs a ON a.user_id = u.id
  WHERE u.id = ?
`;

function formatProfileRow(user) {
  if (!user) return null;
  if (user.role === 'admin' && user.admin_nom) {
    user.nom = user.admin_nom;
  }
  user.photo_profil = user.photo_profil || user.tech_photo || null;
  const roles = [];
  if (user.is_admin) roles.push('admin');
  if (user.is_tech) roles.push('technicien');
  if (user.is_client) roles.push('client');
  user.roles = roles.length ? roles : ['client'];
  delete user.tech_photo;
  delete user.admin_nom;
  delete user.is_admin;
  delete user.is_tech;
  delete user.is_client;
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
  const conn = await pool.getConnection();
  try {
    const { nom, prenom, telephone, adresse, specialite, email } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const n = nom !== undefined ? String(nom).trim() : undefined;
    const p = prenom !== undefined ? String(prenom).trim() : undefined;
    const t = telephone !== undefined ? String(telephone).trim() : undefined;
    const a = adresse !== undefined ? String(adresse).trim() : undefined;
    const s = specialite !== undefined ? String(specialite).trim() : undefined;
    const e = email !== undefined ? String(email).trim() : undefined;

    if (n !== undefined && n.length > 0 && n.length > 100) {
      return respondBadRequest(res, 'Le nom ne doit pas dépasser 100 caractères');
    }
    if (n !== undefined && n.length > 0 && !NAME_PATTERN.test(n)) {
      return respondBadRequest(res, 'Le nom contient des caractères non autorisés');
    }
    if (p !== undefined && p.length > 0 && p.length > 100) {
      return respondBadRequest(res, 'Le prénom ne doit pas dépasser 100 caractères');
    }
    if (p !== undefined && p.length > 0 && !NAME_PATTERN.test(p)) {
      return respondBadRequest(res, 'Le prénom contient des caractères non autorisés');
    }
    if (t !== undefined && t.length > 0 && !TELEPHONE_PATTERN.test(t)) {
      return respondBadRequest(res, 'Format de téléphone invalide');
    }
    if (a !== undefined && a.length > 0 && a.length > 255) {
      return respondBadRequest(res, 'L\'adresse ne doit pas dépasser 255 caractères');
    }
    if (s !== undefined && s.length > 0 && s.length > 100) {
      return respondBadRequest(res, 'La spécialité ne doit pas dépasser 100 caractères');
    }
    if (e !== undefined && e.length > 0) {
      if (!EMAIL_PATTERN.test(e)) {
        return respondBadRequest(res, 'Format d\'email invalide');
      }
    }

    await conn.beginTransaction();

    if (e !== undefined && e.length > 0) {
      try {
        await conn.execute('UPDATE users SET email = ? WHERE id = ?', [e, userId]);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          await conn.rollback();
          return respondBadRequest(res, 'Cet email est déjà utilisé');
        }
        throw err;
      }
    }

    if (role === 'technicien') {
      const techFields = [];
      const techParams = [];
      if (n !== undefined) { techFields.push('nom = ?'); techParams.push(n || null); }
      if (p !== undefined) { techFields.push('prenom = ?'); techParams.push(p || null); }
      if (t !== undefined) { techFields.push('telephone = ?'); techParams.push(t || null); }
      if (a !== undefined) { techFields.push('adresse = ?'); techParams.push(a || null); }
      if (s !== undefined) { techFields.push('specialite = ?'); techParams.push(s || null); }
      if (techFields.length) {
        techParams.push(userId);
        await conn.execute(`UPDATE techniciens SET ${techFields.join(', ')} WHERE user_id = ?`, techParams);
      }
    } else if (role === 'admin') {
      if (n !== undefined) {
        await conn.execute('UPDATE administrateurs SET nom = ? WHERE user_id = ?', [n || null, userId]);
      }
    } else {
      const clientFields = [];
      const clientParams = [];
      if (n !== undefined) { clientFields.push('nom = ?'); clientParams.push(n || null); }
      if (p !== undefined) { clientFields.push('prenom = ?'); clientParams.push(p || null); }
      if (t !== undefined) { clientFields.push('telephone = ?'); clientParams.push(t || null); }
      if (a !== undefined) { clientFields.push('adresse = ?'); clientParams.push(a || null); }
      if (clientFields.length) {
        clientParams.push(userId);
        await conn.execute(`UPDATE clients SET ${clientFields.join(', ')} WHERE user_id = ?`, clientParams);
      }
    }

    await conn.commit();

    const user = await fetchProfile(userId);
    respondData(res, { user }, 'Profil mis à jour');
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
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

    const profile = await fetchProfile(req.user.id);
    const oldPhoto = profile?.photo_profil;

    await pool.execute('UPDATE users SET photo_profil = ? WHERE id = ?', [req.file.filename, req.user.id]);

    if (profile?.role === 'technicien') {
      await pool.execute(
        'UPDATE techniciens SET photo_profil = ? WHERE user_id = ?',
        [req.file.filename, req.user.id]
      );
    }

    if (oldPhoto && oldPhoto !== req.file.filename) {
      const oldPath = upload.resolveUploadPath(oldPhoto);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    const user = await fetchProfile(req.user.id);
    respondData(res, { user }, 'Photo mise à jour');
  } catch (error) {
    next(error);
  }
};
