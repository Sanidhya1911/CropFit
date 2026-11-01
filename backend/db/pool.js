const { Pool } = require('pg');
require('dotenv').config();

const isNeonOrRemote =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('neon.tech') ||
    process.env.DATABASE_URL.includes('sslmode=require') ||
    process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeonOrRemote ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

module.exports = pool;
