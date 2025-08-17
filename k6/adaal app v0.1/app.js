// Global error handlers – must be first
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
});

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKLOG = parseInt(process.env.BACKLOG || '2048', 10); // backlog size

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // adjust based on concurrency
});

// Enable JSON body parsing
app.use(express.json());

// Regex validators
const regex = {
  nin: /^\d{18}$/,          // Algerian National ID (18 digits)
  nss: /^\d{15}$/,          // Social Security Number (15 digits)
  phone: /^0[5-7]\d{8}$/,   // Algerian phone number
  wilaya: /^\d{2}$/,        // Wilaya number (2 digits)
};

// POST /register
app.post('/register', async (req, res) => {
  const { name, nin, nss, phone, wilaya } = req.body;

  if (!name || !regex.nin.test(nin) || !regex.nss.test(nss) ||
      !regex.phone.test(phone) || !regex.wilaya.test(wilaya)) {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const requestId = crypto.randomUUID();

  try {
    await pool.query(
      `INSERT INTO registrations (request_id, name, nin, nss, phone, wilaya, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [requestId, name, nin, nss, phone, wilaya]
    );

    res.status(200).json({ request_id: requestId });

  } catch (err) {
    console.error(new Date().toISOString(), requestId, 'DB Insert Error:', err.code || err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// Liveness probe
app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    console.error('Readiness check failed:', err);
    res.status(500).json({ status: 'not ready', error: 'Database not reachable' });
  }
});

// Start server with custom backlog
app.listen(PORT, '0.0.0.0', BACKLOG, () => {
  console.log(`API running at http://0.0.0.0:${PORT} with backlog ${BACKLOG}`);
});