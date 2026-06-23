const db = require('../config/db');

const NotificationModel = {
  async findByUserId(userId, limit = 50) {
    const safeLimit = Number(limit) || 50;
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY date_envoi DESC LIMIT ?',
      [userId, safeLimit]
    );
    return rows;
  },

  async findUnreadCount(userId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND est_lu = 0',
      [userId]
    );
    return rows[0].count;
  },

  async create(data) {
    const { user_id, titre, message, type = 'info' } = data;
    const [result] = await db.execute(
      'INSERT INTO notifications (user_id, titre, message, type) VALUES (?, ?, ?, ?)',
      [user_id, titre, message, type]
    );
    const [rows] = await db.execute('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async markAsRead(id, userId) {
    const [result] = await db.execute(
      'UPDATE notifications SET est_lu = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async markAllAsRead(userId) {
    await db.execute(
      'UPDATE notifications SET est_lu = 1 WHERE user_id = ? AND est_lu = 0',
      [userId]
    );
  },

  async delete(id, userId) {
    const [result] = await db.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = NotificationModel;
