const express = require('express');
const pool = require('../db');
const { createDocumentNumber } = require('../utils/documentSequences');
const { ok, created, validationFail, notFound, serverError } = require('../utils/httpResponse');
const { parseSearch, parseLimit, parseOffset } = require('../utils/queryParams');

const router = express.Router();

function buildInvoicePayload(body) {
  const customerId = typeof body.customerId === 'string' ? body.customerId.trim() : '';
  const shipmentId = typeof body.shipmentId === 'string' ? body.shipmentId.trim() : '';
  const issuedDate = body.issuedDate ? new Date(body.issuedDate) : null;
  const dueDate = body.dueDate ? new Date(body.dueDate) : null;
  const amount = Number(body.amount ?? 0);
  const tax = Number(body.tax ?? 0);
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  const paymentStatus = typeof body.paymentStatus === 'string' ? body.paymentStatus.trim().toUpperCase() : 'BELUM_BAYAR';

  return {
    customerId,
    shipmentId,
    issuedDate,
    dueDate,
    amount,
    tax,
    notes,
    paymentStatus,
  };
}

function validateInvoice(payload) {
  const errors = {};

  if (!payload.customerId) {
    errors.customerId = 'Pelanggan wajib diisi';
  }

  if (!payload.shipmentId) {
    errors.shipmentId = 'Pengiriman wajib diisi';
  }

  if (!payload.issuedDate || Number.isNaN(payload.issuedDate.getTime())) {
    errors.issuedDate = 'Tanggal terbit tidak valid';
  }

  if (!payload.dueDate || Number.isNaN(payload.dueDate.getTime())) {
    errors.dueDate = 'Jatuh tempo tidak valid';
  }

  if (payload.issuedDate && payload.dueDate && payload.dueDate < payload.issuedDate) {
    errors.dueDate = 'Jatuh tempo tidak boleh lebih kecil dari tanggal terbit';
  }

  if (Number.isNaN(payload.amount) || payload.amount < 0) {
    errors.amount = 'Jumlah harus berupa angka minimal 0';
  }

  if (Number.isNaN(payload.tax) || payload.tax < 0) {
    errors.tax = 'Pajak harus berupa angka minimal 0';
  }

  if (!['BELUM_BAYAR', 'SEBAGIAN', 'LUNAS', 'LEWAT_JATUH_TEMPO'].includes(payload.paymentStatus)) {
    errors.paymentStatus = 'Status pembayaran tidak valid';
  }

  return errors;
}

function mapInvoiceRow(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    shipmentId: row.shipment_id,
    issuedDate: row.issued_date,
    dueDate: row.due_date,
    amount: Number(row.amount),
    tax: Number(row.tax),
    total: Number(row.total),
    paymentStatus: row.payment_status,
    notes: row.notes,
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
      whereClause += ` AND (invoice_number ILIKE $${params.length} OR notes ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      whereClause += ` AND payment_status = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT id, invoice_number, customer_id, shipment_id, issued_date, due_date, amount, tax, total, payment_status, notes, created_at, updated_at
      FROM invoices
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return ok(res, 'Daftar faktur berhasil dimuat', result.rows.map(mapInvoiceRow));
  } catch (error) {
    return serverError(res, 'Gagal memuat faktur', error);
  }
});

router.post('/', async (req, res) => {
  const payload = buildInvoicePayload(req.body);
  const errors = validateInvoice(payload);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validasi faktur gagal',
      errors,
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const invoiceNumber = await createDocumentNumber('invoice', 'INV', client);
    const total = payload.amount + payload.tax;

    const result = await client.query(
      `
        INSERT INTO invoices (
          invoice_number,
          customer_id,
          shipment_id,
          issued_date,
          due_date,
          amount,
          tax,
          total,
          payment_status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, invoice_number, customer_id, shipment_id, issued_date, due_date, amount, tax, total, payment_status, notes, created_at, updated_at
      `,
      [
        invoiceNumber,
        payload.customerId,
        payload.shipmentId,
        payload.issuedDate,
        payload.dueDate,
        payload.amount,
        payload.tax,
        total,
        payload.paymentStatus,
        payload.notes,
      ]
    );

    await client.query('COMMIT');

    return created(res, 'Faktur berhasil dibuat', mapInvoiceRow(result.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');
    return serverError(res, 'Gagal membuat faktur', error);
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, invoice_number, customer_id, shipment_id, issued_date, due_date, amount, tax, total, payment_status, notes, created_at, updated_at
        FROM invoices
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Faktur tidak ditemukan');
    }

    return ok(res, 'Faktur berhasil dimuat', mapInvoiceRow(result.rows[0]));
  } catch (error) {
    return serverError(res, 'Gagal memuat faktur', error);
  }
});

router.put('/:id', async (req, res) => {
  const payload = buildInvoicePayload(req.body);
  const errors = validateInvoice(payload);

  if (Object.keys(errors).length > 0) {
    return validationFail(res, 'Validasi faktur gagal', errors);
  }

  try {
    const total = payload.amount + payload.tax;
    const result = await pool.query(
      `
        UPDATE invoices
        SET customer_id = $1,
            shipment_id = $2,
            issued_date = $3,
            due_date = $4,
            amount = $5,
            tax = $6,
            total = $7,
            payment_status = $8,
            notes = $9
        WHERE id = $10 AND deleted_at IS NULL
        RETURNING id, invoice_number, customer_id, shipment_id, issued_date, due_date, amount, tax, total, payment_status, notes, created_at, updated_at
      `,
      [
        payload.customerId,
        payload.shipmentId,
        payload.issuedDate,
        payload.dueDate,
        payload.amount,
        payload.tax,
        total,
        payload.paymentStatus,
        payload.notes,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return notFound(res, 'Faktur tidak ditemukan');
    }

    return ok(res, 'Faktur berhasil diperbarui', mapInvoiceRow(result.rows[0]));
  } catch (error) {
    return serverError(res, 'Gagal memperbarui faktur', error);
  }
});

router.patch('/:id/status', async (req, res) => {
  const paymentStatus = typeof req.body.paymentStatus === 'string' ? req.body.paymentStatus.trim().toUpperCase() : '';

  if (!['BELUM_BAYAR', 'SEBAGIAN', 'LUNAS', 'LEWAT_JATUH_TEMPO'].includes(paymentStatus)) {
    return validationFail(res, 'Status pembayaran tidak valid');
  }

  try {
    const result = await pool.query(
      `
        UPDATE invoices
        SET payment_status = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id, invoice_number, customer_id, shipment_id, issued_date, due_date, amount, tax, total, payment_status, notes, created_at, updated_at
      `,
      [paymentStatus, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faktur tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Status pembayaran berhasil diperbarui',
      data: mapInvoiceRow(result.rows[0]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status pembayaran',
      error: error.message,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        UPDATE invoices
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faktur tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Faktur berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus faktur',
      error: error.message,
    });
  }
});

module.exports = router;
