const pool = require('../config/db');

const ClientModel = {
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
};

module.exports = ClientModel;
