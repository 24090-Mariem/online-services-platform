const pool = require('../config/db');

const TechnicienModel = {
  async findAll(limit = null, offset = 0) {
    let sql = `SELECT t.*, u.email, u.is_active, COALESCE(t.photo_profil, u.photo_profil) AS photo_profil, u.created_at
       FROM techniciens t
       JOIN users u ON u.id = t.user_id
       WHERE u.is_active = 1
       ORDER BY t.id DESC`;
    const params = [];
    if (limit != null) {
      const n = Number(limit);
      if (!Number.isInteger(n) || n < 1) throw new Error('LIMIT must be a positive integer');
      sql += ` LIMIT ?`;
      params.push(Math.min(n, 100));
    }
    if (offset != null) {
      const n = Number(offset);
      if (!Number.isInteger(n) || n < 0) throw new Error('OFFSET must be a non-negative integer');
      if (n > 0) {
        sql += ` OFFSET ?`;
        params.push(n);
      }
    }
    const [rows] = params.length > 0 ? await pool.query(sql, params) : await pool.execute(sql);
    return rows;
  },

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM techniciens');
    return rows[0].total;
  },

  async findVerified(limit = null, offset = 0) {
    let sql = `SELECT t.*, u.email, u.is_active, COALESCE(t.photo_profil, u.photo_profil) AS photo_profil, u.created_at
       FROM techniciens t
       JOIN users u ON u.id = t.user_id
       WHERE u.is_active = 1 AND t.est_verifie = 1
       ORDER BY t.score DESC, t.nom ASC`;
    const params = [];
    if (limit != null) {
      const n = Number(limit);
      if (!Number.isInteger(n) || n < 1) throw new Error('LIMIT must be a positive integer');
      sql += ` LIMIT ?`;
      params.push(Math.min(n, 100));
    }
    if (offset != null) {
      const n = Number(offset);
      if (!Number.isInteger(n) || n < 0) throw new Error('OFFSET must be a non-negative integer');
      if (n > 0) {
        sql += ` OFFSET ?`;
        params.push(n);
      }
    }
    const [rows] = params.length > 0 ? await pool.query(sql, params) : await pool.execute(sql);
    return rows;
  },

  async countVerified() {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM techniciens t JOIN users u ON u.id = t.user_id WHERE u.is_active = 1 AND t.est_verifie = 1'
    );
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, u.email, u.is_active, COALESCE(t.photo_profil, u.photo_profil) AS photo_profil, u.created_at
       FROM techniciens t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM techniciens WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { user_id, nom, prenom, telephone, adresse, specialite, piece_identite, photo_profil } = data;
    const [result] = await pool.execute(
      `INSERT INTO techniciens (user_id, nom, prenom, telephone, adresse, specialite, piece_identite, photo_profil)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, nom, prenom, telephone || null, adresse || null, specialite || null, piece_identite || null, photo_profil || null]
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['nom', 'prenom', 'telephone', 'adresse', 'specialite', 'piece_identite', 'photo_profil', 'est_verifie', 'score', 'badge'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return true;
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE techniciens SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM techniciens WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async search(query) {
    const { q, specialite, ville } = query;
    let sql = `SELECT t.*, u.email FROM techniciens t JOIN users u ON u.id = t.user_id WHERE t.est_verifie = 1`;
    const params = [];
    if (q) {
      sql += ` AND (t.nom LIKE ? OR t.prenom LIKE ? OR t.specialite LIKE ?)`;
      const p = `%${q}%`;
      params.push(p, p, p);
    }
    if (specialite) {
      sql += ` AND t.specialite = ?`;
      params.push(specialite);
    }
    if (ville) {
      sql += ` AND t.adresse LIKE ?`;
      params.push(`%${ville}%`);
    }
    sql += ` ORDER BY t.score DESC, t.nom ASC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async addScore(technicienId, note) {
  const points = Number(note) * 10;

  const [rows] = await pool.execute(
    `UPDATE techniciens
     SET score = score + ?
     WHERE id = ?`,
    [points, technicienId]
  );

  return rows.affectedRows > 0;
},
async recalculateScore(technicienId) {
  const [rows] = await pool.execute(
    `UPDATE techniciens t
     SET t.score = (
       SELECT COALESCE(SUM(a.note * 10), 0)
       FROM avis a
       WHERE a.technicien_id = ?
     )
     WHERE t.id = ?`,
    [technicienId, technicienId]
  );

  return rows.affectedRows > 0;
}
};

module.exports = TechnicienModel;
