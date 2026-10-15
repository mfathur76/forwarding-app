const express = require('express');
const pool = require('../db');
const { ok, created, validationFail, notFound, serverError } = require('../utils/httpResponse');
const { parseSearch, parseLimit, parseOffset } = require('../utils/queryParams');

const router = express.Router();

function buildCustomerPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : null;
  const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
  const email = typeof body.email === 'string' ? body.email.trim() : null;
  const npwp = typeof body.npwp === 'string' ? body.npwp.trim() : null;
  const address = typeof body.address === 'string' ? body.address.trim() : null;
  const type =
    body.type === "COMPANY"
      ? "COMPANY"
      : "INDIVIDUAL";
  return { type, name, company, phone, email, npwp, address };
}

function validateCustomer(payload) {
  const errors = {};

  if (!payload.name) {
    errors.name = 'Nama pelanggan wajib diisi';
  }

  if (payload.type === 'COMPANY' && !payload.company) {
    errors.company = 'Nama perusahaan wajib diisi untuk tipe COMPANY';
  }

  if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
    errors.email = 'Format email tidak valid';
  }

  return errors;
}

router.get('/', async (req, res) => {
  try {
    const search = parseSearch(req.query.search);
    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);

    const params = [];
    let whereClause = 'WHERE deleted_at IS NULL';

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (name ILIKE $${params.length} OR company ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT id, name, type, company, phone, email, npwp, address, created_at, updated_at
      FROM customers
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return ok(res, 'Daftar pelanggan berhasil dimuat', result.rows);
  } catch (error) {
    return serverError(res, 'Gagal memuat pelanggan', error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, type, name, company, phone, email, npwp, address, created_at, updated_at
        FROM customers
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pelanggan tidak ditemukan');
    }

    return ok(res, 'Pelanggan berhasil dimuat', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal memuat pelanggan', error);
  }
});

router.post('/', async (req, res) => {
  const payload = buildCustomerPayload(req.body);
  const errors = validateCustomer(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi pelanggan gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO customers (type, name, company, phone, email, npwp, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, type, name, company, phone, email, npwp, address, created_at, updated_at
      `,
      [payload.type, payload.name, payload.company, payload.phone, payload.email, payload.npwp, payload.address]
    );

    return created(res, 'Pelanggan berhasil dibuat', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal membuat pelanggan', error);
  }
});

router.put('/:id', async (req, res) => {
  const payload = buildCustomerPayload(req.body);
  const errors = validateCustomer(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi pelanggan gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        UPDATE customers
        SET name = $1,
            company = $2,
            phone = $3,
            email = $4,
            npwp = $5,
            address = $6,
            type = $7
        WHERE id = $8 AND deleted_at IS NULL
        RETURNING id, type, name, company, phone, email, npwp, address, created_at, updated_at
      `,
      [payload.name, payload.company, payload.phone, payload.email, payload.npwp, payload.address, payload.type, req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pelanggan tidak ditemukan');
    }

    return ok(res, 'Pelanggan berhasil diperbarui', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal memperbarui pelanggan', error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        UPDATE customers
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pelanggan tidak ditemukan');
    }

    return ok(res, 'Pelanggan berhasil dihapus');
  } catch (error) {
    return serverError(res, 'Gagal menghapus pelanggan', error);
  }
});

module.exports = router;
