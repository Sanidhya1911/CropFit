require('dotenv').config();
const express = require('express');
const cors = require('cors');

const recommendRoutes = require('./routes/recommend');
const cropRoutes = require('./routes/crops');
const ragRoutes = require('./routes/rag');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
// FIX: Set cors() to default to allow incoming traffic from your Vercel deployment URL
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Request Logger (Dev) ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/recommend', recommendRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/rag', ragRoutes);

const pool = require('./db/pool');

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  let dbCount = 0;
  try {
    const r = await pool.query('SELECT count(*) FROM crop_profiles');
    dbStatus = 'connected';
    dbCount = parseInt(r.rows[0].count, 10);
  } catch (e) {
    dbStatus = 'error';
    dbError = e.message;
  }

  res.json({
    status: 'ok',
    service: 'CropFit API',
    database: {
      status: dbStatus,
      error: dbError,
      crop_count: dbCount,
      has_database_url: !!process.env.DATABASE_URL,
      database_url_host: process.env.DATABASE_URL ? (process.env.DATABASE_URL.split('@')[1] || '').split('/')[0] : null,
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.url} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message, stack: process.env.NODE_ENV === 'production' ? err.message : err.stack });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌾 CropFit API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;