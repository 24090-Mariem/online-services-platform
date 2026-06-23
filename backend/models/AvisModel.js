const db = require('../config/db');

const AvisModel = {
  async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM avis');
    return rows[0].total;
  },

  async findByTechnicien(technicienId) {
    const [rows] = await db.execute(
      'SELECT * FROM avis WHERE technicien_id = ? ORDER BY created_at DESC',
      [technicienId]
    );
    return rows;
  },

  async create(data) {
    const { reservation_id, client_id, technicien_id, note, commentaire } = data;
    const [result] = await db.execute(
      'INSERT INTO avis (reservation_id, client_id, technicien_id, note, commentaire) VALUES (?, ?, ?, ?, ?)',
      [reservation_id, client_id, technicien_id, note, commentaire || null]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await db.execute(
      'SELECT a.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom FROM avis a JOIN techniciens t ON a.technicien_id = t.id ORDER BY a.created_at DESC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM avis WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async update(id, data) {
    const { note, commentaire } = data;
    const [result] = await db.execute(
      'UPDATE avis SET note = COALESCE(?, note), commentaire = COALESCE(?, commentaire) WHERE id = ?',
      [note || null, commentaire || null, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM avis WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = AvisModel;
