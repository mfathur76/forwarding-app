const express = require('express');
const pool = require('../db');
const { ok, serverError } = require('../utils/httpResponse');

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const [shipmentCount, customerCount, driverCount, vehicleCount, paidRevenue, outstandingRevenue, latestShipments, shipmentStatuses] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM shipments WHERE deleted_at IS NULL`),
      pool.query(`SELECT COUNT(*)::int AS total FROM customers WHERE deleted_at IS NULL`),
      pool.query(`SELECT COUNT(*)::int AS total FROM drivers WHERE deleted_at IS NULL`),
      pool.query(`SELECT COUNT(*)::int AS total FROM vehicles WHERE deleted_at IS NULL`),
      pool.query(`SELECT COALESCE(SUM(total), 0)::numeric AS total FROM invoices WHERE deleted_at IS NULL AND payment_status = 'LUNAS'`),
      pool.query(`SELECT COALESCE(SUM(total), 0)::numeric AS total FROM invoices WHERE deleted_at IS NULL AND payment_status IN ('BELUM_BAYAR', 'SEBAGIAN', 'LEWAT_JATUH_TEMPO')`),
      pool.query(
        `
          SELECT tracking_number, origin, destination, status, created_at
          FROM shipments
          WHERE deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT 5
        `
      ),
      pool.query(
        `
          SELECT status, COUNT(*)::int AS total
          FROM shipments
          WHERE deleted_at IS NULL
          GROUP BY status
          ORDER BY status ASC
        `
      ),
    ]);

    const data = {
      metrics: {
        totalShipments: shipmentCount.rows[0].total,
        totalCustomers: customerCount.rows[0].total,
        totalDrivers: driverCount.rows[0].total,
        totalVehicles: vehicleCount.rows[0].total,
        paidRevenue: Number(paidRevenue.rows[0].total),
        outstandingRevenue: Number(outstandingRevenue.rows[0].total),
      },
      latestShipments: latestShipments.rows.map((row) => ({
        trackingNumber: row.tracking_number,
        route: `${row.origin} -> ${row.destination}`,
        status: row.status,
        createdAt: row.created_at,
      })),
      shipmentStatuses: shipmentStatuses.rows.map((row) => ({
        status: row.status,
        total: row.total,
      })),
    };
    return ok(res, 'Ringkasan dashboard berhasil dimuat', data);
  } catch (error) {
    return serverError(res, 'Gagal memuat ringkasan dashboard', error);
  }
});

module.exports = router;
