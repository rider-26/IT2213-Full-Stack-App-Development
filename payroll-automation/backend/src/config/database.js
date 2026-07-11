// Shared PostgreSQL connection pool. All services query through this pool
// instead of hardcoding data in JavaScript. Run `docker-compose up` from
// the project root to start Postgres before starting the backend.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/payroll_automation',
});

module.exports = { pool };
