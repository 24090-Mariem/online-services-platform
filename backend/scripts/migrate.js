const fs = require('fs');
const path = require('path');
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

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Running migration: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);
      for (const statement of statements) {
        await connection.query(statement);
      }
      console.log(`  ${file} executed successfully`);
    }

    console.log('\nAll migrations executed successfully');

    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tables:", tables.map(t => Object.values(t)[0]).join(', '));

    await connection.end();
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
