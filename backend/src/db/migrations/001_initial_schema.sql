-- 001_initial_schema.sql
-- (RECONSTRUCTED - couldnt find the real one so made this based on what
-- rosterSync.test.js and databaseInit.test.js actually check for. if the
-- real file shows up compare column names before trusting this one)

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename    VARCHAR(255) PRIMARY KEY,
  applied_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(150) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pay_period (
  id          SERIAL PRIMARY KEY,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS timesheet (
  id              SERIAL PRIMARY KEY,
  pay_period_id   INTEGER NOT NULL REFERENCES pay_period(id) ON DELETE CASCADE,
  staff_id        INTEGER NOT NULL REFERENCES staff(id),
  hours           NUMERIC(5,2) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  entity_id   INTEGER,
  action      VARCHAR(60) NOT NULL,
  details     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
