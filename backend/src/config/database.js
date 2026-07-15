// database.js
// (RECONSTRUCTED - i dont actually have the real one so made a basic version.
// swap this for the real file if u find it, just double check it still exports { pool })
//
// basic postgres connection setup, reads the db creds from .env

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : (process.env.PGHOST || 'localhost'),
  port: process.env.DATABASE_URL ? undefined : (process.env.PGPORT || 5432),
  user: process.env.DATABASE_URL ? undefined : (process.env.PGUSER || 'postgres'),
  password: process.env.DATABASE_URL ? undefined : (process.env.PGPASSWORD || 'postgres'),
  database: process.env.DATABASE_URL ? undefined : (process.env.PGDATABASE || 'payroll_automation'),
});

pool.on('error', (err) => {
  console.error('[database] Unexpected error on idle client', err);
});

module.exports = { pool };
