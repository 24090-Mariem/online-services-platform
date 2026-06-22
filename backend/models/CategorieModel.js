const pool = require('../config/db');

const CategorieModel = {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY nom ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { nom, description, icone } = data;
    const [result] = await pool.execute(
      'INSERT INTO categories (nom, description, icone) VALUES (?, ?, ?)',
      [nom, description || null, icone || null]
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['nom', 'description', 'icone'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return true;
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = CategorieModel;
