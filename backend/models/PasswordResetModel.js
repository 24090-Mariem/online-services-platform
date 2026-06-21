const crypto = require('crypto');
const pool = require('../config/db');

const TABLE = 'password_reset_tokens';

const PasswordResetModel = {
  async create(userId, ttlMs = 3 * 60 * 1000) {
    const code = String(crypto.randomInt(100000, 1000000));
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + ttlMs);

    await pool.execute(
      `INSERT INTO ${TABLE} (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );

    return code;
  },

  async findByToken(rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const [rows] = await pool.execute(
      `SELECT id, user_id, expires_at FROM ${TABLE} WHERE token = ?`,
      [tokenHash]
    );

    const row = rows[0];
    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) {
      await pool.execute(`DELETE FROM ${TABLE} WHERE id = ?`, [row.id]);
      return null;
    }

    return row;
  },

  async delete(tokenId) {
    await pool.execute(`DELETE FROM ${TABLE} WHERE id = ?`, [tokenId]);
  },

  async deleteAllForUser(userId) {
    await pool.execute(`DELETE FROM ${TABLE} WHERE user_id = ?`, [userId]);
  },
};

module.exports = PasswordResetModel;
