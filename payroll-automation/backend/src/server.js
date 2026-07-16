// .env lives at the payroll-automation project root, one level above
// backend/ — must load before anything below reads process.env.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = require('./app');
const rosterSyncScheduler = require('./jobs/rosterSyncScheduler');
const payPeriodService = require('./services/payPeriodService');

const PORT = process.env.PORT || 5000;

async function start() {
  // Also doubles as a startup DB connectivity check — if Postgres isn't
  // running, this fails loudly here instead of on the first API request.
  await payPeriodService.ensurePayPeriodsSeeded();

  app.listen(PORT, () => {
    console.log(`Payroll backend running on http://localhost:${PORT}`);
  });

  rosterSyncScheduler.start();
}

start().catch((err) => {
  console.error('[server] Failed to start — is PostgreSQL running? (docker-compose up)', err.message);
  process.exit(1);
});
