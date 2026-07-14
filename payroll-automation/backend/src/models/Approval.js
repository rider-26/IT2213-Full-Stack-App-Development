// In-memory "database" of payroll records for UC-004 (Review & Approve Payroll).
// This will later be replaced by real payroll_line data coming from UC-003.

let payrollRecords = [
  {
    id: 1,
    staffName: "Andrea Chua",
    payPeriod: "2026-06-01 to 2026-06-15",
    grossPay: 1200.0,
    deductions: 240.0,
    netPay: 960.0,
    status: "pending_approval", // pending_approval | approved | rejected
    approvedBy: null,
    decidedAt: null,
    comment: null,
  },
  {
    id: 2,
    staffName: "Kieron Tan",
    payPeriod: "2026-06-01 to 2026-06-15",
    grossPay: 1500.0,
    deductions: 300.0,
    netPay: 1200.0,
    status: "pending_approval",
    approvedBy: null,
    decidedAt: null,
    comment: null,
  },
  {
    id: 3,
    staffName: "Robert Leon",
    payPeriod: "2026-06-01 to 2026-06-15",
    grossPay: 1800.0,
    deductions: 360.0,
    netPay: 1440.0,
    status: "pending_approval",
    approvedBy: null,
    decidedAt: null,
    comment: null,
  },
];

function getAll() {
  return payrollRecords;
}

function findById(id) {
  return payrollRecords.find((record) => record.id === Number(id));
}

// Used by tests so every test starts from the same known state.
function resetSampleData() {
  payrollRecords = payrollRecords.map((record) => ({
    ...record,
    status: "pending_approval",
    approvedBy: null,
    decidedAt: null,
    comment: null,
  }));
}

module.exports = { getAll, findById, resetSampleData };
