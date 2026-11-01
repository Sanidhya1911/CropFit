const { Pool } = require('pg');
require('dotenv').config();

const rawUrl = process.env.DATABASE_URL || '';
if (!rawUrl) {
  console.error('❌ FATAL: DATABASE_URL is missing in environment variables!');
}

// Clean channel_binding parameter if present as it can fail on some Linux/Node environments
const cleanUrl = rawUrl.replace('&channel_binding=require', '').replace('channel_binding=require&', '');

const isRemoteOrNeon =
  cleanUrl.includes('neon.tech') ||
  cleanUrl.includes('sslmode=') ||
  process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: isRemoteOrNeon ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = pool;
