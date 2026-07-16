// Combines all route files into one router that app.js can mount.
// Only the roster routes exist so far (UC-001) — teammates will add their
// own routes here for their use cases (timesheets, payroll, approvals, payments).

const express = require('express');
const rosterRoutes = require('./roster');
const payPeriodRoutes = require('./payPeriods');

const router = express.Router();

router.use('/roster', rosterRoutes);
router.use('/pay-periods', payPeriodRoutes);

module.exports = router;
