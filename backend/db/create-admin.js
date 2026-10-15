// Membuat/memperbarui user admin dan menonaktifkan admin default.
// Pemakaian: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... node db/create-admin.js
require('dotenv').config();
const pool = require('../db');

const DEFAULT_EMAIL = 'admin@forwarding.local';

async function run() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const fullName = process.env.ADMIN_NAME || 'Admin Operasional';

  if (!email || password.length < 10) {
    throw new Error('ADMIN_EMAIL wajib diisi dan ADMIN_PASSWORD minimal 10 karakter');
  }

  await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash, role, is_active)
      VALUES ($1, $2, crypt($3, gen_salt('bf')), 'admin_operasional', TRUE)
      ON CONFLICT (email) DO UPDATE
        SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, is_active = TRUE
    `,
    [fullName, email, password]
  );

  if (email !== DEFAULT_EMAIL) {
    await pool.query('UPDATE users SET is_active = FALSE WHERE email = $1', [DEFAULT_EMAIL]);
    console.log(`Admin default ${DEFAULT_EMAIL} dinonaktifkan`);
  }

  console.log(`Admin ${email} siap dipakai`);
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
