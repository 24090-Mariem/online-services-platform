const pool = require('../config/db');

const TechnicienModel = {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT t.*, u.email, u.is_active, COALESCE(t.photo_profil, u.photo_profil) AS photo_profil, u.created_at
       FROM techniciens t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.id DESC`
    );
    return rows;
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
};

module.exports = TechnicienModel;
