const pool = require('../config/db');

const AdministrateurModel = {
  async findAll(limit = null, offset = 0) {
    let sql = `SELECT a.*, u.email, u.is_active, u.created_at
       FROM administrateurs a
       JOIN users u ON u.id = a.user_id
       ORDER BY a.id DESC`;
    if (limit != null) {
      const n = Number(limit);
      if (!Number.isInteger(n) || n < 1) throw new Error('LIMIT must be a positive integer');
      sql += ` LIMIT ${n}`;
    }
    if (offset != null) {
      const n = Number(offset);
      if (!Number.isInteger(n) || n < 0) throw new Error('OFFSET must be a non-negative integer');
      if (n > 0) sql += ` OFFSET ${n}`;
    }
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM administrateurs');
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.email, u.is_active, u.created_at
       FROM administrateurs a
       JOIN users u ON u.id = a.user_id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM administrateurs WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { user_id, nom } = data;
    const [result] = await pool.execute(
      'INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)',
      [user_id, nom]
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    if (data.nom !== undefined) { fields.push('nom = ?'); values.push(data.nom); }
    if (fields.length === 0) return true;
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE administrateurs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM administrateurs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = AdministrateurModel;
