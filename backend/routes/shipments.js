const express = require('express');
const pool = require('../db');
const { createDocumentNumber } = require('../utils/documentSequences');
const { ok, created, validationFail, notFound, serverError } = require('../utils/httpResponse');
const { parseSearch, parseLimit, parseOffset } = require('../utils/queryParams');

const router = express.Router();

function buildShipmentPayload(body) {
  const customerId = typeof body.customerId === 'string' ? body.customerId.trim() : '';
  const driverId = typeof body.driverId === 'string' && body.driverId.trim() ? body.driverId.trim() : null;
  const vehicleId = typeof body.vehicleId === 'string' && body.vehicleId.trim() ? body.vehicleId.trim() : null;
  const origin = typeof body.origin === 'string' ? body.origin.trim() : '';
  const destination = typeof body.destination === 'string' ? body.destination.trim() : '';
  const weightKg = Number(body.weightKg ?? 0);
  const price = Number(body.price ?? 0);
  const pickupDate = body.pickupDate ? new Date(body.pickupDate) : null;
  const deliveryDate = body.deliveryDate ? new Date(body.deliveryDate) : null;
  const cargoDescription = typeof body.cargoDescription === 'string' ? body.cargoDescription.trim() : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : 'MENUNGGU';

  return {
    customerId,
    driverId,
    vehicleId,
    origin,
    destination,
    weightKg,
    price,
    pickupDate,
    deliveryDate,
    cargoDescription,
    notes,
    status,
  };
}

function validateShipment(payload) {
  const errors = {};

  if (!payload.customerId) {
    errors.customerId = 'Pelanggan wajib diisi';
  }

  if (!payload.origin) {
    errors.origin = 'Asal wajib diisi';
  }

  if (!payload.destination) {
    errors.destination = 'Tujuan wajib diisi';
  }

  if (Number.isNaN(payload.weightKg) || payload.weightKg < 0) {
    errors.weightKg = 'Berat harus berupa angka minimal 0';
  }

  if (Number.isNaN(payload.price) || payload.price < 0) {
    errors.price = 'Harga harus berupa angka minimal 0';
  }

  if (payload.pickupDate && Number.isNaN(payload.pickupDate.getTime())) {
    errors.pickupDate = 'Tanggal pickup tidak valid';
  }

  if (payload.deliveryDate && Number.isNaN(payload.deliveryDate.getTime())) {
    errors.deliveryDate = 'Tanggal antar tidak valid';
  }

  if (payload.pickupDate && payload.deliveryDate && payload.deliveryDate < payload.pickupDate) {
    errors.deliveryDate = 'Tanggal antar tidak boleh lebih kecil dari tanggal pickup';
  }

  if (!['MENUNGGU', 'DALAM_PERJALANAN', 'TERKIRIM', 'DIBATALKAN'].includes(payload.status)) {
    errors.status = 'Status pengiriman tidak valid';
  }

  return errors;
}

function mapShipmentRow(row) {
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    customerId: row.customer_id,
    driverId: row.driver_id,
    vehicleId: row.vehicle_id,
    origin: row.origin,
    destination: row.destination,
    weightKg: Number(row.weight_kg),
    price: Number(row.price),
    pickupDate: row.pickup_date,
    deliveryDate: row.delivery_date,
    cargoDescription: row.cargo_description,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const search = parseSearch(req.query.search);
    const status = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : '';
    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);

    const params = [];
    let whereClause = 'WHERE deleted_at IS NULL';

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (tracking_number ILIKE $${params.length} OR origin ILIKE $${params.length} OR destination ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT id, tracking_number, customer_id, driver_id, vehicle_id, origin, destination, weight_kg, price, pickup_date, delivery_date, cargo_description, notes, status, created_at, updated_at
      FROM shipments
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return ok(res, 'Daftar pengiriman berhasil dimuat', result.rows.map(mapShipmentRow));
  } catch (error) {
    return serverError(res, 'Gagal memuat pengiriman', error);
  }
});

router.post('/', async (req, res) => {
  const payload = buildShipmentPayload(req.body);
  const errors = validateShipment(payload);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validasi pengiriman gagal',
      errors,
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const trackingNumber = await createDocumentNumber('shipment', 'RAT', client);

    const result = await client.query(
      `
        INSERT INTO shipments (
          tracking_number,
          customer_id,
          driver_id,
          vehicle_id,
          origin,
          destination,
          weight_kg,
          price,
          pickup_date,
          delivery_date,
          cargo_description,
          notes,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, tracking_number, customer_id, driver_id, vehicle_id, origin, destination, weight_kg, price, pickup_date, delivery_date, cargo_description, notes, status, created_at, updated_at
      `,
      [
        trackingNumber,
        payload.customerId,
        payload.driverId,
        payload.vehicleId,
        payload.origin,
        payload.destination,
        payload.weightKg,
        payload.price,
        payload.pickupDate,
        payload.deliveryDate,
        payload.cargoDescription,
        payload.notes,
        payload.status,
      ]
    );

    await client.query('COMMIT');

    return created(res, 'Pengiriman berhasil dibuat', mapShipmentRow(result.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');
    return serverError(res, 'Gagal membuat pengiriman', error);
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, tracking_number, customer_id, driver_id, vehicle_id, origin, destination, weight_kg, price, pickup_date, delivery_date, cargo_description, notes, status, created_at, updated_at
        FROM shipments
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pengiriman tidak ditemukan');
    }

    return ok(res, 'Pengiriman berhasil dimuat', mapShipmentRow(result.rows[0]));
  } catch (error) {
    return serverError(res, 'Gagal memuat pengiriman', error);
  }
});

router.put('/:id', async (req, res) => {
  const payload = buildShipmentPayload(req.body);
  const errors = validateShipment(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi pengiriman gagal', errors);
  }

  try {
    const result = await pool.query(
      `
        UPDATE shipments
        SET customer_id = $1,
            driver_id = $2,
            vehicle_id = $3,
            origin = $4,
            destination = $5,
            weight_kg = $6,
            price = $7,
            pickup_date = $8,
            delivery_date = $9,
            cargo_description = $10,
            notes = $11,
            status = $12
        WHERE id = $13 AND deleted_at IS NULL
        RETURNING id, tracking_number, customer_id, driver_id, vehicle_id, origin, destination, weight_kg, price, pickup_date, delivery_date, cargo_description, notes, status, created_at, updated_at
      `,
      [
        payload.customerId,
        payload.driverId,
        payload.vehicleId,
        payload.origin,
        payload.destination,
        payload.weightKg,
        payload.price,
        payload.pickupDate,
        payload.deliveryDate,
        payload.cargoDescription,
        payload.notes,
        payload.status,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Pengiriman tidak ditemukan');
    }

    return ok(res, 'Pengiriman berhasil diperbarui', mapShipmentRow(result.rows[0]));
  } catch (error) {
    return serverError(res, 'Gagal memperbarui pengiriman', error);
  }
});

router.patch('/:id/status', async (req, res) => {
  const status = typeof req.body.status === 'string' ? req.body.status.trim().toUpperCase() : '';

  if (!['MENUNGGU', 'DALAM_PERJALANAN', 'TERKIRIM', 'DIBATALKAN'].includes(status)) {
    return res.status(422).json({
      success: false,
      message: 'Status pengiriman tidak valid',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query(
      `
        SELECT id, driver_id, vehicle_id, status
        FROM shipments
        WHERE id = $1 AND deleted_at IS NULL
        FOR UPDATE
      `,
      [req.params.id]
    );

    if (currentResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Pengiriman tidak ditemukan',
      });
    }

    const current = currentResult.rows[0];

    await client.query(
      `
        UPDATE shipments
        SET status = $1
        WHERE id = $2
      `,
      [status, req.params.id]
    );

    if (status === 'DALAM_PERJALANAN') {
      if (current.driver_id) {
        await client.query(`UPDATE drivers SET status = 'BERTUGAS' WHERE id = $1 AND deleted_at IS NULL`, [current.driver_id]);
      }
      if (current.vehicle_id) {
        await client.query(`UPDATE vehicles SET status = 'BERTUGAS' WHERE id = $1 AND deleted_at IS NULL`, [current.vehicle_id]);
      }
    }

    if (status === 'TERKIRIM' || status === 'DIBATALKAN') {
      if (current.driver_id) {
        await client.query(`UPDATE drivers SET status = 'TERSEDIA' WHERE id = $1 AND deleted_at IS NULL`, [current.driver_id]);
      }
      if (current.vehicle_id) {
        await client.query(`UPDATE vehicles SET status = 'TERSEDIA' WHERE id = $1 AND deleted_at IS NULL`, [current.vehicle_id]);
      }
    }

    const updatedResult = await client.query(
      `
        SELECT id, tracking_number, customer_id, driver_id, vehicle_id, origin, destination, weight_kg, price, pickup_date, delivery_date, cargo_description, notes, status, created_at, updated_at
        FROM shipments
        WHERE id = $1
      `,
      [req.params.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Status pengiriman berhasil diperbarui',
      data: mapShipmentRow(updatedResult.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status pengiriman',
      error: error.message,
    });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        UPDATE shipments
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengiriman tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Pengiriman berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengiriman',
      error: error.message,
    });
  }
});

module.exports = router;
