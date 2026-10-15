const express = require('express');
const pool = require('../db');
const { ok, created, validationFail, notFound, serverError } = require('../utils/httpResponse');
const { parseSearch, parseLimit, parseOffset } = require('../utils/queryParams');

const router = express.Router();

function buildDriverPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
  const licenseNumber = typeof body.licenseNumber === 'string' ? body.licenseNumber.trim() : '';
  const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : 'TERSEDIA';
  const address = typeof body.address === 'string' ? body.address.trim() : null;

  return { name, phone, licenseNumber, status, address };
}

function validateDriver(payload) {
  const errors = {};

  if (!payload.name) {
    errors.name = 'Nama pengemudi wajib diisi';
  }

  if (!payload.licenseNumber) {
    errors.licenseNumber = 'No SIM wajib diisi';
  }

  if (!['TERSEDIA', 'BERTUGAS', 'NONAKTIF'].includes(payload.status)) {
    errors.status = 'Status pengemudi tidak valid';
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
      whereClause += ` AND (name ILIKE $${params.length} OR license_number ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT id, name, phone, license_number AS "licenseNumber", status, address, created_at, updated_at
      FROM drivers
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return ok(res, 'Daftar pengemudi berhasil dimuat', result.rows);
  } catch (error) {
    return serverError(res, 'Gagal memuat pengemudi', error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, phone, license_number AS "licenseNumber", status, address, created_at, updated_at
        FROM drivers
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pengemudi tidak ditemukan');
    }

    return ok(res, 'Pengemudi berhasil dimuat', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal memuat pengemudi', error);
  }
});

router.post('/', async (req, res) => {
  const payload = buildDriverPayload(req.body);
  const errors = validateDriver(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi pengemudi gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO drivers (name, phone, license_number, status, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, phone, license_number AS "licenseNumber", status, address, created_at, updated_at
      `,
      [payload.name, payload.phone, payload.licenseNumber, payload.status, payload.address]
    );

    return created(res, 'Pengemudi berhasil dibuat', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal membuat pengemudi', error);
  }
});

router.put('/:id', async (req, res) => {
  const payload = buildDriverPayload(req.body);
  const errors = validateDriver(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi pengemudi gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        UPDATE drivers
        SET name = $1,
            phone = $2,
            license_number = $3,
            status = $4,
            address = $5
        WHERE id = $6 AND deleted_at IS NULL
        RETURNING id, name, phone, license_number AS "licenseNumber", status, address, created_at, updated_at
      `,
      [payload.name, payload.phone, payload.licenseNumber, payload.status, payload.address, req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pengemudi tidak ditemukan');
    }

    return ok(res, 'Pengemudi berhasil diperbarui', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal memperbarui pengemudi', error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        UPDATE drivers
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pengemudi tidak ditemukan');
    }

    return ok(res, 'Pengemudi berhasil dihapus');
  } catch (error) {
    return serverError(res, 'Gagal menghapus pengemudi', error);
  }
});

module.exports = router;
