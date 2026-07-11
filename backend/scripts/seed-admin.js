require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@codeva.ma',
  password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  nom: process.env.ADMIN_NOM || 'Administrateur',
};

async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.execute(
      'SELECT id FROM users WHERE email = ?',
      [ADMIN.email]
    );
    if (existing.length > 0) {
      console.log(`Email "${ADMIN.email}" existe déjà (user_id: ${existing[0].id})`);
      await conn.rollback();
      return;
    }

    const hash = await bcrypt.hash(ADMIN.password, 12);
    const [userResult] = await conn.execute(
      'INSERT INTO users (email, password_hash, is_active) VALUES (?, ?, 1)',
      [ADMIN.email, hash]
    );
    const userId = userResult.insertId;

    await conn.execute(
      'INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)',
      [userId, ADMIN.nom]
    );

    await conn.commit();
    console.log(`Admin créé avec succès !`);
    console.log(`  Email    : ${ADMIN.email}`);
    console.log(`  Mot de passe : ${ADMIN.password}`);
    console.log(`  user_id  : ${userId}`);
  } catch (err) {
    await conn.rollback();
    console.error('Erreur :', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
