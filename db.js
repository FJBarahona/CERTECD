const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'CERTECD PERÚ S.R.L.',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root', // <-- Aquí está la corrección
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL - CERTECD SGPM');
});

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err.message);
});

module.exports = pool;