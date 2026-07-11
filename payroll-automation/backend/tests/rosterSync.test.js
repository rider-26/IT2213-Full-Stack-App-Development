// UC-001 tests: pure edge-case checks for hoursCalculator, plus
// integration-style checks for the sync logic against a throwaway pay
// period (created and torn down here) so real demo data is never touched.

// Must run before config/database.js is required, since that's where the
// Postgres connection string is read from process.env.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { calculateHours } = require('../src/utils/hoursCalculator');
const { pool } = require('../src/config/database');
const googleSheetsAdapter = require('../src/adapters/googleSheetsAdapter');
const rosterSyncService = require('../src/services/rosterSyncService');

describe('calculateHours', () => {
  test('normal day shift', () => {
    expect(calculateHours('08:00', '17:00')).toBe(9);
  });

  test('shift that crosses midnight', () => {
    expect(calculateHours('22:00', '06:00')).toBe(8);
  });

  test('missing clock-out returns NaN instead of a negative number', () => {
    expect(Number.isNaN(calculateHours('08:00', ''))).toBe(true);
  });

  test('missing clock-in returns NaN instead of a negative number', () => {
    expect(Number.isNaN(calculateHours('', '17:00'))).toBe(true);
  });
});

describe('runRosterSync', () => {
  const originalGetRosterRows = googleSheetsAdapter.getRosterRows;
  let testPeriodId;
  let inactiveStaffId;

  beforeAll(async () => {
    const period = await pool.query(
      `INSERT INTO pay_period (start_date, end_date) VALUES ('2027-01-01', '2027-01-14') RETURNING id`
    );
    testPeriodId = period.rows[0].id;

    const inactiveStaff = await pool.query(
      `INSERT INTO staff (external_ref, full_name, status)
       VALUES ('TEST-INACTIVE', 'Test Inactive Person', 'inactive') RETURNING id`
    );
    inactiveStaffId = inactiveStaff.rows[0].id;
  });

  afterAll(async () => {
    googleSheetsAdapter.getRosterRows = originalGetRosterRows;
    await pool.query('DELETE FROM timesheet WHERE pay_period_id = $1', [testPeriodId]);
    await pool.query('DELETE FROM audit_log WHERE entity_id = $1', [testPeriodId]);
    await pool.query('DELETE FROM pay_period WHERE id = $1', [testPeriodId]);
    await pool.query('DELETE FROM staff WHERE id = $1', [inactiveStaffId]);
    await pool.end();
  });

  test('sums multiple shifts, excludes unmatched/inactive/invalid-time rows from totals', async () => {
    googleSheetsAdapter.getRosterRows = async () => [
      { staffId: 'S001', staffName: 'Andrea Chua', date: '2027-01-01', clockIn: '08:00', clockOut: '17:00' },
      { staffId: 'S001', staffName: 'Andrea Chua', date: '2027-01-02', clockIn: '08:00', clockOut: '17:00' },
      { staffId: 'S999', staffName: 'Nobody Real', date: '2027-01-01', clockIn: '08:00', clockOut: '17:00' },
      { staffId: 'S002', staffName: 'Kieron Tan', date: '2027-01-01', clockIn: '08:00', clockOut: '' },
      { staffId: 'TEST-INACTIVE', staffName: 'Test Inactive Person', date: '2027-01-01', clockIn: '08:00', clockOut: '17:00' },
    ];

    const result = await rosterSyncService.runRosterSync(testPeriodId, 'manual');

    expect(result.success).toBe(true);
    expect(result.staffSynced).toBe(1); // only Andrea Chua: active + matched
    expect(result.totalHours).toBe(18); // two 9-hour shifts
    expect(result.unmatchedCount).toBe(2); // Nobody Real + the inactive staff row
    expect(result.invalidTimeCount).toBe(1); // Kieron Tan's blank clock-out

    const andrea = result.draftTimesheets.find((t) => t.staffId === 'S001');
    expect(andrea.shifts).toHaveLength(2);
    expect(andrea.shifts[0]).toMatchObject({ clockIn: '08:00', clockOut: '17:00', matchedBy: 'id' });

    const inactiveEntry = result.unmatched.find((entry) => entry.rosterRawName.includes('inactive staff'));
    expect(inactiveEntry).toBeDefined();
  });

  test('sheet-unreachable path returns an error and keeps the previous draft', async () => {
    googleSheetsAdapter.getRosterRows = async () => {
      throw new Error('simulated network failure');
    };

    const result = await rosterSyncService.runRosterSync(testPeriodId, 'manual');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ROSTER_SOURCE_UNREACHABLE');
    expect(result.previousDraft.success).toBe(true);
  });
});
