const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../db');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map((row) => row.filename));
}

async function run() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    // Skema awal (init) ikut dijalankan agar database baru di cloud bisa disiapkan dengan satu perintah.
    // File init idempotent, jadi aman dijalankan pada database lokal yang sudah ada.
    const initDir = path.join(__dirname, 'init');
    const files = [
      ...fs.readdirSync(initDir).filter((file) => file.endsWith('.sql')).sort().map((file) => ({ name: `init/${file}`, full: path.join(initDir, file) })),
      ...fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort().map((file) => ({ name: file, full: path.join(migrationsDir, file) })),
    ];

    const applied = await getAppliedMigrations(client);

    for (const { name: file, full } of files) {
      if (applied.has(file)) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(full, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Failed on ${file}: ${error.message}`);
      }
    }

    console.log('Migrations complete');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
