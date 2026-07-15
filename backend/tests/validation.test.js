// tests for UC-002. first half is just testing the pure functions in
// discrepancyRules.js directly (no db needed for these, quick to run).
// second half actually hits the real database with a throwaway pay period
// so we can test the full flow properly. cleans up after itself in afterAll
// so it doesnt leave junk data behind

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { detectDiscrepancies, DAILY_LIMIT_HOURS, WEEKLY_LIMIT_HOURS } = require('../src/utils/discrepancyRules');
const { pool } = require('../src/config/database');
const validationService = require('../src/services/validationService');

describe('detectDiscrepancies', () => {
  test('flags a day exceeding the daily overtime limit', () => {
    const rows = [{ id: 1, staffId: 1, workDate: '2027-01-01', hours: DAILY_LIMIT_HOURS + 1 }];
    const flags = detectDiscrepancies(rows, []);
    expect(flags).toContainEqual(
      expect.objectContaining({ flagType: 'OVERTIME_DAILY', staffId: 1, actualValue: DAILY_LIMIT_HOURS + 1 })
    );
  });

  test('does not flag a day at exactly the daily limit', () => {
    // exactly 8 hrs should be fine, only OVER 8 should get flagged
    const rows = [{ id: 1, staffId: 1, workDate: '2027-01-01', hours: DAILY_LIMIT_HOURS }];
    const flags = detectDiscrepancies(rows, []);
    expect(flags.some((f) => f.flagType === 'OVERTIME_DAILY')).toBe(false);
  });

  test('flags a staff member whose weekly total exceeds the weekly limit', () => {
    // mon-fri same week, adds up to more than the weekly limit
    const rows = [
      { id: 1, staffId: 2, workDate: '2027-02-01', hours: 9 }, // mon
      { id: 2, staffId: 2, workDate: '2027-02-02', hours: 9 },
      { id: 3, staffId: 2, workDate: '2027-02-03', hours: 9 },
      { id: 4, staffId: 2, workDate: '2027-02-04', hours: 9 },
      { id: 5, staffId: 2, workDate: '2027-02-05', hours: 9 }, // total = 45
    ];
    const flags = detectDiscrepancies(rows, []);
    expect(flags).toContainEqual(
      expect.objectContaining({ flagType: 'OVERTIME_WEEKLY', staffId: 2, actualValue: 45 })
    );
  });

  test('flags duplicate entries for the same staff and date', () => {
    const rows = [
      { id: 1, staffId: 3, workDate: '2027-01-01', hours: 8 },
      { id: 2, staffId: 3, workDate: '2027-01-01', hours: 8 },
    ];
    const flags = detectDiscrepancies(rows, []);
    const dupFlags = flags.filter((f) => f.flagType === 'DUPLICATE_ENTRY');
    expect(dupFlags).toHaveLength(2); // flags both rows, so staff can pick which one is right
  });

  test('flags an active staff member with zero entries as missing', () => {
    const activeStaff = [{ id: 4, externalRef: 'S004', fullName: 'Missing Person', status: 'active' }];
    const flags = detectDiscrepancies([], activeStaff);
    expect(flags).toContainEqual(
      expect.objectContaining({ flagType: 'MISSING_ENTRY', staffId: 4, actualValue: 0 })
    );
  });

  test('does not flag an inactive staff member with zero entries', () => {
    // inactive ppl obviously wont have hours logged, thats normal not a problem
    const inactiveStaff = [{ id: 5, externalRef: 'S005', fullName: 'Inactive Person', status: 'inactive' }];
    const flags = detectDiscrepancies([], inactiveStaff);
    expect(flags.some((f) => f.staffId === 5)).toBe(false);
  });

  test('clean data produces no flags', () => {
    const rows = [{ id: 1, staffId: 6, workDate: '2027-01-01', hours: 8 }];
    const activeStaff = [{ id: 6, externalRef: 'S006', fullName: 'Fine Person', status: 'active' }];
    expect(detectDiscrepancies(rows, activeStaff)).toEqual([]);
  });
});

describe('validationService', () => {
  let testPeriodId;
  let testStaffId;

  // set up a fake pay period + staff member + one bad timesheet entry before
  // any of the tests below run
  beforeAll(async () => {
    const period = await pool.query(
      `INSERT INTO pay_period (start_date, end_date) VALUES ('2027-03-01', '2027-03-14') RETURNING id`
    );
    testPeriodId = period.rows[0].id;

    const staff = await pool.query(
      `INSERT INTO staff (external_ref, full_name, status)
       VALUES ('TEST-VAL-001', 'Validation Test Person', 'active') RETURNING id`
    );
    testStaffId = staff.rows[0].id;

    await pool.query(
      `INSERT INTO timesheet (pay_period_id, staff_id, work_date, hours)
       VALUES ($1, $2, '2027-03-02', 10)`, // 10hrs = over the daily limit, should get flagged
      [testPeriodId, testStaffId]
    );
  });

  // clean up all the test data so it doesnt clutter the real db
  afterAll(async () => {
    await pool.query('DELETE FROM validation_flag WHERE pay_period_id = $1', [testPeriodId]);
    await pool.query('DELETE FROM timesheet WHERE pay_period_id = $1', [testPeriodId]);
    await pool.query('DELETE FROM audit_log WHERE entity_id = $1', [testPeriodId]);
    await pool.query('DELETE FROM pay_period WHERE id = $1', [testPeriodId]);
    await pool.query('DELETE FROM staff WHERE id = $1', [testStaffId]);
    await pool.end();
  });

  test('runValidation raises a flag for the overtime entry', async () => {
    const result = await validationService.runValidation(testPeriodId);
    expect(result.success).toBe(true);
    expect(result.newlyFlagged).toBeGreaterThanOrEqual(1);
  });

  test('runValidation does not duplicate an already-open flag on a second run', async () => {
    // running it twice shouldnt make 2 flags for the same problem
    const first = await validationService.runValidation(testPeriodId);
    const second = await validationService.runValidation(testPeriodId);
    expect(second.newlyFlagged).toBe(0);
    expect(first.success).toBe(true);
  });

  test('getReview returns the staff member with an open flag', async () => {
    const review = await validationService.getReview(testPeriodId);
    expect(review.success).toBe(true);
    const person = review.staff.find((s) => s.staffId === 'TEST-VAL-001');
    expect(person).toBeDefined();
    expect(person.status).toBe('Flagged');
    expect(person.flags.length).toBeGreaterThanOrEqual(1);
  });

  test('markValidated is blocked while a flag is still open', async () => {
    // shouldnt be able to validate the period while theres unresolved stuff
    const result = await validationService.markValidated(testPeriodId);
    expect(result.success).toBe(false);
    expect(result.error).toBe('UNRESOLVED_DISCREPANCIES');
  });

  test('resolveFlag then markValidated succeeds once no flags remain open', async () => {
    const review = await validationService.getReview(testPeriodId);
    const openFlag = review.staff.flatMap((s) => s.flags).find((f) => f.status === 'OPEN');
    expect(openFlag).toBeDefined();

    const resolve = await validationService.resolveFlag(openFlag.id, { resolution: 'CONFIRMED', notes: 'test confirm' });
    expect(resolve.success).toBe(true);

    // now that the flag is resolved, this should actually work
    const finalResult = await validationService.markValidated(testPeriodId);
    expect(finalResult.success).toBe(true);
  });
});
