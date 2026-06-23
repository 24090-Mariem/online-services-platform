const pool = require('../config/db');

const ClientModel = {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT cl.*, u.email, u.is_active, u.created_at
       FROM clients cl
       JOIN users u ON u.id = cl.user_id
       ORDER BY cl.id DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT cl.*, u.email, u.is_active
       FROM clients cl
       JOIN users u ON u.id = cl.user_id
       WHERE cl.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM clients WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { user_id, nom, prenom, telephone, adresse } = data;
    const [result] = await pool.execute(
      'INSERT INTO clients (user_id, nom, prenom, telephone, adresse) VALUES (?, ?, ?, ?, ?)',
      [user_id, nom, prenom, telephone || null, adresse || null]
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['nom', 'prenom', 'telephone', 'adresse'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return true;
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ClientModel;
