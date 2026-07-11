const pool = require('../config/db');

const roleQuery = `
  CASE
    WHEN EXISTS(SELECT 1 FROM administrateurs a WHERE a.user_id = u.id) THEN 'admin'
    WHEN EXISTS(SELECT 1 FROM techniciens t WHERE t.user_id = u.id) THEN 'technicien'
    ELSE 'client'
  END
`;

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT u.*, ${roleQuery} AS role FROM users u WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.is_active, u.photo_profil,
              ${roleQuery} AS role,
              COALESCE(cl.nom, t.nom, a.nom) AS nom,
              cl.prenom, t.prenom AS tech_prenom,
              cl.telephone, t.telephone AS tech_telephone,
              cl.adresse,
              t.specialite, t.score, t.badge,
              u.last_login, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN clients cl ON cl.user_id = u.id
       LEFT JOIN techniciens t ON t.user_id = u.id
       LEFT JOIN administrateurs a ON a.user_id = u.id
       WHERE u.id = ?`,
      [id]
    );
    const user = rows[0];
    if (user) {
      if (!user.prenom && user.tech_prenom) user.prenom = user.tech_prenom;
      if (!user.telephone && user.tech_telephone) user.telephone = user.tech_telephone;
      delete user.tech_prenom;
      delete user.tech_telephone;
      user.roles = await buildRolesList(user.id);
    }
    return user || null;
  },

  async createUser(conn, { email, password_hash, is_active }) {
    const [result] = await conn.execute(
      'INSERT INTO users (email, password_hash, is_active) VALUES (?, ?, ?)',
      [email, password_hash, is_active ?? 1]
    );

    return result.insertId;
  },

  async createClientProfile(conn, { user_id, nom, prenom, telephone }) {
    await conn.execute(
      'INSERT INTO clients (user_id, nom, prenom, telephone) VALUES (?, ?, ?, ?)',
      [user_id, nom, prenom, telephone || null]
    );
  },

  async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  },
};

async function buildRolesList(userId) {
  const [rows] = await pool.execute(
    `SELECT
       EXISTS(SELECT 1 FROM administrateurs WHERE user_id = ?) AS is_admin,
       EXISTS(SELECT 1 FROM techniciens WHERE user_id = ?) AS is_tech,
       EXISTS(SELECT 1 FROM clients WHERE user_id = ?) AS is_client`,
    [userId, userId, userId]
  );
  const r = rows[0];
  const roles = [];
  if (r.is_admin) roles.push('admin');
  if (r.is_tech) roles.push('technicien');
  if (r.is_client) roles.push('client');
  return roles.length ? roles : ['client'];
}

module.exports = UserModel;