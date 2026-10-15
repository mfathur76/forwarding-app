const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'forwarding_db',
  user: process.env.DB_USER || 'forwarding_user',
  password: process.env.DB_PASSWORD || 'forwarding_pass',
});

module.exports = pool;
