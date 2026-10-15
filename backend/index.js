const express = require('express');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');
const authRouter = require('./routes/auth');
const customersRouter = require('./routes/customers');
const dashboardRouter = require('./routes/dashboard');
const driversRouter = require('./routes/drivers');
const vehiclesRouter = require('./routes/vehicles');
const shipmentsRouter = require('./routes/shipments');
const invoicesRouter = require('./routes/invoices');
const pool = require('./db');

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);

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

app.listen(port, () => {
  console.log(`Forwarding app listening on port ${port}`);
});
