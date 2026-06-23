const db = require('../config/db');

const DemandeTechnicienModel = {

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM demandes_techniciens WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM demandes_techniciens WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await db.execute(
      'SELECT * FROM demandes_techniciens ORDER BY date_demande DESC'
    );
    return rows;
  },

  async create(data) {
    const {
      nom, prenom, email, telephone, specialite, piece_identite, diplome, photo_profil, user_id
    } = data;

    const [result] = await db.execute(
      `INSERT INTO demandes_techniciens
       (nom, prenom, email, telephone, specialite, piece_identite, diplome, photo_profil, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom, prenom || null, email || null, telephone || null,
        specialite || null, piece_identite || null, diplome || null, photo_profil || null,
        user_id || null
      ]
    );

    return result.insertId;
  },

  async approve(id, admin_id, commentaireAdmin) {
    const [result] = await db.execute(
      "UPDATE demandes_techniciens SET statut = 'APPROUVE', commentaire_admin = ? WHERE id = ?",
      [commentaireAdmin || null, id]
    );
    return result.affectedRows > 0;
  },

  async reject(id, admin_id, commentaireAdmin) {
    const [result] = await db.execute(
      "UPDATE demandes_techniciens SET statut = 'REJETE', commentaire_admin = ? WHERE id = ?",
      [commentaireAdmin || null, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM demandes_techniciens WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

};

module.exports = DemandeTechnicienModel;
