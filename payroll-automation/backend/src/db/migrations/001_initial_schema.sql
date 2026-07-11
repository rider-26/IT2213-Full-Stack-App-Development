-- UC-001 schema: staff, pay periods, and the draft timesheets that come
-- out of a roster sync. Other use cases (validation, payroll calculation,
-- approval, payment) will need their own tables — add those in a new
-- numbered migration file rather than editing this one, so everyone's
-- changes stay independent.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE employment_type_enum AS ENUM ('part_time', 'full_time');
CREATE TYPE staff_status_enum AS ENUM ('active', 'inactive');

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref VARCHAR NOT NULL UNIQUE, -- ID used to match roster rows, e.g. "S001"
  full_name VARCHAR NOT NULL,
  employment_type employment_type_enum NOT NULL DEFAULT 'part_time',
  bank_account_no VARCHAR,
  bank_code VARCHAR,
  cpf_eligible BOOLEAN NOT NULL DEFAULT true,
  status staff_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TYPE pay_period_status_enum AS ENUM (
  'draft', 'validated', 'pending_calculation', 'pending_approval', 'approved', 'payment_ready'
);

CREATE TABLE pay_period (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL UNIQUE,
  end_date DATE NOT NULL,
  status pay_period_status_enum NOT NULL DEFAULT 'draft',
  validated_at TIMESTAMP,
  total_gross NUMERIC(12,2),
  total_net NUMERIC(12,2),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TYPE match_status_enum AS ENUM ('matched', 'unmatched');

CREATE TABLE timesheet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_period_id UUID NOT NULL REFERENCES pay_period(id),
  staff_id UUID REFERENCES staff(id), -- null = unmatched roster row (UC-001 alt flow 2a)
  roster_raw_name VARCHAR, -- original roster label, only set when unmatched
  shift_date DATE, -- the date of this one shift; one timesheet row = one shift (UC-001),
                    -- so UC-002 can check things like overlaps/daily caps per date
  total_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  ot_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  ph_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  is_frozen BOOLEAN NOT NULL DEFAULT false, -- true after UC-002 validation freezes the snapshot
  match_status match_status_enum NOT NULL DEFAULT 'unmatched',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
