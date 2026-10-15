require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const authRouter = require('./routes/auth');
const customersRouter = require('./routes/customers');
const dashboardRouter = require('./routes/dashboard');
const driversRouter = require('./routes/drivers');
const vehiclesRouter = require('./routes/vehicles');
const shipmentsRouter = require('./routes/shipments');
const invoicesRouter = require('./routes/invoices');
const pool = require('./db');

const app = express();

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
}

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({
      success: true,
      message: 'Service is running',
      data: {
        serverTime: result.rows[0].now,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.use(authMiddleware);

app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Forwarding API is ready',
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/vehicles', vehiclesRouter);
app.use('/api/v1/shipments', shipmentsRouter);
app.use('/api/v1/invoices', invoicesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = app;
