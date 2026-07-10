const db = require('../config/db');

const GalerieModel = {
  async findByTechnicien(technicienId) {
    const [rows] = await db.execute(`
      SELECT g.*, r.statut AS reservation_statut, r.date_service,
             a.note AS avis_note, a.commentaire AS avis_commentaire
      FROM galerie g
      LEFT JOIN reservations r ON g.reservation_id = r.id
      LEFT JOIN avis a ON a.reservation_id = g.reservation_id
      WHERE g.technicien_id = ?
      ORDER BY g.date_ajout DESC
    `, [technicienId]);
    return rows;
  },

  async findCompletedByTechnicien(technicienId) {
    const [rows] = await db.execute(`
      SELECT g.*, r.statut AS reservation_statut, r.date_service,
             a.note AS avis_note, a.commentaire AS avis_commentaire
      FROM galerie g
      JOIN reservations r ON g.reservation_id = r.id
      LEFT JOIN avis a ON a.reservation_id = g.reservation_id
      WHERE g.technicien_id = ? AND r.statut = 'TERMINEE'
      ORDER BY g.date_ajout DESC
    `, [technicienId]);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM galerie WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { technicien_id, reservation_id, image, description, type } = data;
    const [result] = await db.execute(
      'INSERT INTO galerie (technicien_id, reservation_id, image, description, type) VALUES (?, ?, ?, ?, ?)',
      [technicien_id, reservation_id || null, image || null, description || null, type || null]
    );
    return result.insertId;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM galerie WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = GalerieModel;
