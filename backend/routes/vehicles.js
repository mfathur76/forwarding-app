const express = require('express');
const pool = require('../db');
const { ok, created, validationFail, notFound, serverError } = require('../utils/httpResponse');
const { parseSearch, parseLimit, parseOffset } = require('../utils/queryParams');

const router = express.Router();

function buildVehiclePayload(body) {
  const plateNumber = typeof body.plateNumber === 'string' ? body.plateNumber.trim() : '';
  const vehicleType = typeof body.vehicleType === 'string' ? body.vehicleType.trim() : '';
  const brand = typeof body.brand === 'string' ? body.brand.trim() : null;
  const capacityKg = Number(body.capacityKg ?? 0);
  const year = body.year === undefined || body.year === null || body.year === '' ? null : Number(body.year);
  const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : 'TERSEDIA';

  return { plateNumber, vehicleType, brand, capacityKg, year, status };
}

function validateVehicle(payload) {
  const errors = {};

  if (!payload.plateNumber) {
    errors.plateNumber = 'Plat nomor wajib diisi';
  }

  if (!payload.vehicleType) {
    errors.vehicleType = 'Tipe kendaraan wajib diisi';
  }

  if (Number.isNaN(payload.capacityKg) || payload.capacityKg < 0) {
    errors.capacityKg = 'Kapasitas harus berupa angka minimal 0';
  }

  if (payload.year !== null && (Number.isNaN(payload.year) || payload.year < 1900 || payload.year > 2100)) {
    errors.year = 'Tahun kendaraan tidak valid';
  }

  if (!['TERSEDIA', 'BERTUGAS', 'PERAWATAN', 'NONAKTIF'].includes(payload.status)) {
    errors.status = 'Status kendaraan tidak valid';
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
      whereClause += ` AND (plate_number ILIKE $${params.length} OR vehicle_type ILIKE $${params.length} OR brand ILIKE $${params.length})`;
    }

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT id, plate_number AS "plateNumber", vehicle_type AS "vehicleType", brand, capacity_kg AS "capacityKg", year, status, created_at, updated_at
      FROM vehicles
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return ok(res, 'Daftar kendaraan berhasil dimuat', result.rows);
  } catch (error) {
    return serverError(res, 'Gagal memuat kendaraan', error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, plate_number AS "plateNumber", vehicle_type AS "vehicleType", brand, capacity_kg AS "capacityKg", year, status, created_at, updated_at
        FROM vehicles
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Kendaraan tidak ditemukan');
    }

    return ok(res, 'Kendaraan berhasil dimuat', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal memuat kendaraan', error);
  }
});

router.post('/', async (req, res) => {
  const payload = buildVehiclePayload(req.body);
  const errors = validateVehicle(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi kendaraan gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO vehicles (plate_number, vehicle_type, brand, capacity_kg, year, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, plate_number AS "plateNumber", vehicle_type AS "vehicleType", brand, capacity_kg AS "capacityKg", year, status, created_at, updated_at
      `,
      [payload.plateNumber, payload.vehicleType, payload.brand, payload.capacityKg, payload.year, payload.status]
    );

    return created(res, 'Kendaraan berhasil dibuat', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal membuat kendaraan', error);
  }
});

router.put('/:id', async (req, res) => {
  const payload = buildVehiclePayload(req.body);
  const errors = validateVehicle(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi kendaraan gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        UPDATE vehicles
        SET plate_number = $1,
            vehicle_type = $2,
            brand = $3,
            capacity_kg = $4,
            year = $5,
            status = $6
        WHERE id = $7 AND deleted_at IS NULL
        RETURNING id, plate_number AS "plateNumber", vehicle_type AS "vehicleType", brand, capacity_kg AS "capacityKg", year, status, created_at, updated_at
      `,
      [payload.plateNumber, payload.vehicleType, payload.brand, payload.capacityKg, payload.year, payload.status, req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Kendaraan tidak ditemukan');
    }

    return ok(res, 'Kendaraan berhasil diperbarui', result.rows[0]);
  } catch (error) {
    return serverError(res, 'Gagal memperbarui kendaraan', error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        UPDATE vehicles
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Kendaraan tidak ditemukan');
    }

    return ok(res, 'Kendaraan berhasil dihapus');
  } catch (error) {
    return serverError(res, 'Gagal menghapus kendaraan', error);
  }
});

module.exports = router;
