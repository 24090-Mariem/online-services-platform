const mysql2 = require('mysql2/promise');
const pool = mysql2.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'plateforme_services',
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
  // Active les requêtes préparées côté serveur
  namedPlaceholders:  false,
});

/* Test de connexion à l'export */
pool.authenticate = async () => {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
};

module.exports = pool;