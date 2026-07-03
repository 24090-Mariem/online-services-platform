const db = require('../config/db');

const AvisModel = {
  async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM avis');
    return rows[0].total;
  },

  async findByClient(clientId) {
    const [rows] = await db.execute(
      `SELECT a.*, s.titre AS service_titre, t.nom AS technicien_nom, t.prenom AS technicien_prenom
       FROM avis a
       JOIN reservations r ON a.reservation_id = r.id
       JOIN services s ON r.service_id = s.id
       JOIN techniciens t ON a.technicien_id = t.id
       WHERE a.client_id = ?
       ORDER BY a.date_avis DESC`,
      [clientId]
    );
    return rows;
  },

  async findByTechnicien(technicienId) {
    const [rows] = await db.execute(
      'SELECT * FROM avis WHERE technicien_id = ? ORDER BY date_avis DESC',
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
      'SELECT a.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom FROM avis a JOIN techniciens t ON a.technicien_id = t.id ORDER BY a.date_avis DESC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM avis WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByReservationId(reservationId) {
    const [rows] = await db.execute(
      'SELECT * FROM avis WHERE reservation_id = ? LIMIT 1',
      [reservationId]
    );
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
