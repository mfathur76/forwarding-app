const express = require('express');
const pool = require('../db');
const { ok, validationFail, unauthorized, forbidden, serverError } = require('../utils/httpResponse');

const router = express.Router();

router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return validationFail(res, 'Email dan password wajib diisi');
  }

  try {
    const result = await pool.query(
      `
        SELECT id, full_name, email, role, is_active
        FROM users
        WHERE email = $1
          AND password_hash = crypt($2, password_hash)
        LIMIT 1
      `,
      [email, password]
    );

    if (result.rowCount === 0) {
      return unauthorized(res, 'Email atau password salah');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return forbidden(res, 'Akun tidak aktif');
    }

    const token = `${user.id.substring(0, 20)}${Date.now()}`;
    return ok(res, 'Login berhasil', {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return serverError(res, 'Gagal memproses login', error);
  }
});

router.post('/logout', async (req, res) => {
  return ok(res, 'Logout berhasil');
});

module.exports = router;
