const db = require('../config/db');

const GalerieModel = {
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
};

module.exports = GalerieModel;
