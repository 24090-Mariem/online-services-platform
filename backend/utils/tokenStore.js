const crypto = require('crypto');
const pool = require('../config/db');

const TABLE = 'refresh_tokens';

class TokenStore {
  constructor() {
    this._cleanupInterval = setInterval(() => this._cleanup(), 60 * 60 * 1000);
  }

  _hash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async store(userId, ttlMs = 7 * 24 * 60 * 60 * 1000, familyId = null) {
    const raw = crypto.randomBytes(32).toString('hex');
    const hash = this._hash(raw);
    const expiresAt = new Date(Date.now() + ttlMs);
    const tokenFamily = familyId || crypto.randomBytes(16).toString('hex');

    await pool.execute(
      `INSERT INTO ${TABLE} (user_id, token_hash, expires_at, family_id)
       VALUES (?, ?, ?, ?)`,
      [userId, hash, expiresAt, tokenFamily]
    );

    return { raw, familyId: tokenFamily };
  }

  async verify(token) {
    if (!token) return null;

    const hash = this._hash(token);

    const [rows] = await pool.execute(
      `SELECT user_id, revoked, expires_at, family_id
       FROM ${TABLE}
       WHERE token_hash = ?`,
      [hash]
    );

    const row = rows[0];

    if (!row) return null;

    const expired = new Date(row.expires_at) < new Date();

    if (row.revoked || expired) {
      if (row.family_id) {
        await pool.execute(
          `DELETE FROM ${TABLE} WHERE family_id = ?`,
          [row.family_id]
        );
      } else {
        await pool.execute(
          `DELETE FROM ${TABLE} WHERE token_hash = ?`,
          [hash]
        );
      }
      return null;
    }

    return { userId: row.user_id, familyId: row.family_id };
  }

  async revoke(token) {
    if (!token) return;

    const hash = this._hash(token);

    await pool.execute(
      `DELETE FROM ${TABLE} WHERE token_hash = ?`,
      [hash]
    );
  }

  async revokeAllForUser(userId) {
    await pool.execute(
      `DELETE FROM ${TABLE} WHERE user_id = ?`,
      [userId]
    );
  }

  async _cleanup() {
    try {
      const [result] = await pool.execute(
        `DELETE FROM ${TABLE}
         WHERE expires_at < NOW() OR revoked = 1`
      );

      if (result.affectedRows > 0) {
        console.log(
          `[TokenStore] cleanup: ${result.affectedRows} tokens supprimés`
        );
      }
    } catch (err) {
      console.error('[TokenStore] cleanup error:', err);
    }
  }

  destroy() {
    clearInterval(this._cleanupInterval);
  }
}

module.exports = new TokenStore();
