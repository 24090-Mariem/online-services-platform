const db = require('../config/db');

const ServiceModel = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT s.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom,
             t.photo_profil AS technicien_photo, c.nom AS categorie_nom
      FROM services s
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      ORDER BY s.id DESC
    `);
    return rows;
  },

  async findAllActive() {
    const [rows] = await db.execute(`
      SELECT s.*, t.nom AS technicien_nom, t.prenom AS technicien_prenom,
             t.photo_profil AS technicien_photo, c.nom AS categorie_nom
      FROM services s
      JOIN techniciens t ON s.technicien_id = t.id
      JOIN categories c ON s.categorie_id = c.id
      WHERE s.est_actif = 1
      ORDER BY s.id DESC
    `);
    return rows;
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
    const { categorie_id, titre, description, image, prix, duree, est_actif } = data;
    await db.execute(
      'UPDATE services SET categorie_id = ?, titre = ?, description = ?, image = ?, prix = ?, duree = ?, est_actif = ? WHERE id = ?',
      [categorie_id, titre, description, image ?? null, prix || null, duree || null, est_actif ?? 1, id]
    );
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ServiceModel;
