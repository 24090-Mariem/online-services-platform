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
      `SELECT u.id, u.email, u.is_active, ${roleQuery} AS role, u.last_login, u.created_at, u.updated_at
       FROM users u WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async createUser(conn, { email, password_hash }) {
    const [result] = await conn.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, password_hash]
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

module.exports = UserModel;