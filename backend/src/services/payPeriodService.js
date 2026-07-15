// payPeriodService.js
// (RECONSTRUCTED - server.js calls ensurePayPeriodsSeeded() when it starts up,
// so i made this up to match. also gives the frontend dropdown something to show)

const { pool } = require('../config/database');

// just makes sure theres at least 1 pay period in the db so the app isnt
// totally empty the first time you run it
async function ensurePayPeriodsSeeded() {
  const existing = await pool.query('SELECT COUNT(*) FROM pay_period');
  if (Number(existing.rows[0].count) > 0) return; // already got some, dont need to do anything

  const today = new Date();
  const start = new Date(today);
  start.setDate(1); // just defaulting to start of this month, nothing fancy
  const end = new Date(start);
  end.setDate(start.getDate() + 13); // 2 week cycle

  await pool.query(
    'INSERT INTO pay_period (start_date, end_date) VALUES ($1, $2)',
    [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );
}

// returns all pay periods, newest first, and marks whichever one contains today's date
async function listPayPeriods() {
  const result = await pool.query(
    'SELECT id, start_date, end_date FROM pay_period ORDER BY start_date DESC'
  );
  const todayStr = new Date().toISOString().slice(0, 10);

  return result.rows.map((p) => ({
    id: p.id,
    start_date: p.start_date,
    end_date: p.end_date,
    current: todayStr >= p.start_date.toISOString().slice(0, 10) && todayStr <= p.end_date.toISOString().slice(0, 10),
  }));
}

module.exports = { ensurePayPeriodsSeeded, listPayPeriods };
