const { Pool } = require('pg');

const useSsl = process.env.DB_SSL === 'true';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'forwarding_db',
  user: process.env.DB_USER || 'forwarding_user',
  password: process.env.DB_PASSWORD || 'forwarding_pass',
  // Di Lambda tiap instance cukup 1 koneksi agar DB tidak kehabisan koneksi.
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 10000,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
