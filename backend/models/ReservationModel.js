const db = require('../config/db');

const ReservationModel = {
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM reservations WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByClient(clientId) {
    const [rows] = await db.execute(`
      SELECT r.*, s.titre AS service_titre, s.prix AS service_prix,
             s.technicien_id, t.nom AS technicien_nom, t.prenom AS technicien_prenom,
             c.nom AS categorie_nom, a.id AS avis_id, a.note AS avis_note
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      LEFT JOIN avis a ON a.reservation_id = r.id
      WHERE r.client_id = ?
      ORDER BY r.date_reservation DESC
    `, [clientId]);
    return rows;
  },

  async findByTechnicien(technicienId) {
    const [rows] = await db.execute(`
      SELECT r.*, s.titre AS service_titre,
             cl.nom AS client_nom, cl.prenom AS client_prenom, cl.telephone AS client_telephone
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      JOIN clients cl ON r.client_id = cl.id
      WHERE s.technicien_id = ?
      ORDER BY r.date_reservation DESC
    `, [technicienId]);
    return rows;
  },

  async create(data) {
    const { client_id, service_id, date_service, notes, montant } = data;
    const [result] = await db.execute(
      'INSERT INTO reservations (client_id, service_id, date_service, notes, montant) VALUES (?, ?, ?, ?, ?)',
      [client_id, service_id, date_service, notes || null, montant || null]
    );
    return result.insertId;
  },

  async updateStatus(id, statut) {
    await db.execute(
      'UPDATE reservations SET statut = ? WHERE id = ?',
      [statut, id]
    );
  },

  async findByUserId(userId) {
    const [rows] = await db.execute(`
      SELECT r.*, s.titre AS service_titre, s.prix AS service_prix,
             t.nom AS technicien_nom, t.prenom AS technicien_prenom
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN clients c ON r.client_id = c.id
      WHERE c.user_id = ?
      ORDER BY r.date_reservation DESC
    `, [userId]);
    return rows;
  }
};

module.exports = ReservationModel;
