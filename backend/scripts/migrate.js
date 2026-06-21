const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: '.env.test'
});

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });

    console.log("Connected to DB:", process.env.DB_NAME);

    const sql = fs.readFileSync(
      './migrations/001_initial_shema.sql',
      'utf8'
    );

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Migrations executed successfully');

    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tables created:", tables);

    await connection.end();
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();