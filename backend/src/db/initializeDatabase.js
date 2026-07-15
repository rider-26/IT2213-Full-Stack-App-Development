// initializeDatabase.js
// (RECONSTRUCTED - built this to match what databaseInit.test.js expects,
// since i couldnt find the real file. should still work but worth double
// checking against the actual one if it turns up)
//
// basically just runs every .sql file in the migrations folder that hasnt
// been run yet, in order, and keeps track of which ones its already done
// in the schema_migrations table so it doesnt redo them

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function initializeDatabase() {
  // make sure the tracking table exists first, just in case this is a
  // totally fresh db with nothing in it yet
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // filenames are numbered (001_, 002_...) so sorting = correct order

  const applied = await pool.query('SELECT filename FROM schema_migrations');
  const appliedSet = new Set(applied.rows.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue; // already ran this one, skip

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[initializeDatabase] Applying ${file}...`);

    // wrapping in a transaction so if the migration fails halfway it doesnt
    // leave the db in some weird half-applied state
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

module.exports = { initializeDatabase };
