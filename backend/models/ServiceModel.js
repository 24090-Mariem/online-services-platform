const db = require('../config/db');

const ServiceModel = {
  async findAll(limit = null, offset = 0) {
    let sql = `
      SELECT s.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom,
             t.photo_profil AS technicien_photo, c.nom AS categorie_nom
      FROM services s
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      ORDER BY s.id DESC
    `;
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
    const [rows] = await db.execute(sql);
    return rows;
  },

  async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM services');
    return rows[0].total;
  },

  async findAllActive(limit = null, offset = 0) {
    let sql = `
      SELECT s.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom,
             t.photo_profil AS technicien_photo, c.nom AS categorie_nom
      FROM services s
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      WHERE s.est_actif = 1
      ORDER BY s.id DESC
    `;
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
    const [rows] = await db.execute(sql);
    return rows;
  },

  async countAllActive() {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM services WHERE est_actif = 1');
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM services WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByTechnicien(technicienId) {
    const [rows] = await db.execute(
      'SELECT s.*, c.nom AS categorie_nom FROM services s JOIN categories c ON s.categorie_id = c.id WHERE s.technicien_id = ? ORDER BY s.id DESC',
      [technicienId]
    );
    return rows;
  },

  async create(data) {
    const { technicien_id, categorie_id, titre, description, prix, duree, image } = data;
    const [result] = await db.execute(
      'INSERT INTO services (technicien_id, categorie_id, titre, description, image, prix, duree) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [technicien_id, categorie_id, titre, description || null, image || null, prix || null, duree || null]
    );
    return result.insertId;
  },

  async update(id, data) {
    const allowed = ['categorie_id', 'titre', 'description', 'image', 'prix', 'duree', 'est_actif'];
    const sets = [];
    const params = [];
    for (const field of allowed) {
      if (field in data) {
        sets.push(`${field} = ?`);
        params.push(data[field] ?? null);
      }
    }
    if (sets.length === 0) return;
    params.push(id);
    await db.execute(`UPDATE services SET ${sets.join(', ')} WHERE id = ?`, params);
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async search(filters = {}) {
    const { q, categorie_id, ville, prix_min, prix_max, limit, offset } = filters;
    let sql = `
      SELECT s.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom,
             t.photo_profil AS technicien_photo, t.adresse AS technicien_adresse,
             t.score AS technicien_score, c.nom AS categorie_nom
      FROM services s
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      WHERE s.est_actif = 1
    `;
    const params = [];

    if (q) {
      sql += ` AND s.titre LIKE ?`;
      params.push(`%${q}%`);
    }
    if (categorie_id) {
      sql += ` AND s.categorie_id = ?`;
      params.push(categorie_id);
    }
    if (ville) {
      sql += ` AND t.adresse LIKE ?`;
      params.push(`%${ville}%`);
    }
    if (prix_min != null) {
      sql += ` AND s.prix >= ?`;
      params.push(prix_min);
    }
    if (prix_max != null) {
      sql += ` AND s.prix <= ?`;
      params.push(prix_max);
    }

    sql += ` ORDER BY s.id DESC`;

    const nLimit = limit != null ? Number(limit) : null;
    const nOffset = offset != null ? Number(offset) : null;
    if (nLimit != null && Number.isInteger(nLimit) && nLimit > 0) {
      sql += ` LIMIT ${nLimit}`;
    }
    if (nOffset != null && Number.isInteger(nOffset) && nOffset > 0) {
      sql += ` OFFSET ${nOffset}`;
    }

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  async countSearch(filters = {}) {
    const { q, categorie_id, ville, prix_min, prix_max } = filters;
    let sql = `
      SELECT COUNT(*) AS total
      FROM services s
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      WHERE s.est_actif = 1
    `;
    const params = [];

    if (q) {
      sql += ` AND s.titre LIKE ?`;
      params.push(`%${q}%`);
    }
    if (categorie_id) {
      sql += ` AND s.categorie_id = ?`;
      params.push(categorie_id);
    }
    if (ville) {
      sql += ` AND t.adresse LIKE ?`;
      params.push(`%${ville}%`);
    }
    if (prix_min != null) {
      sql += ` AND s.prix >= ?`;
      params.push(prix_min);
    }
    if (prix_max != null) {
      sql += ` AND s.prix <= ?`;
      params.push(prix_max);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }
};

module.exports = ServiceModel;
