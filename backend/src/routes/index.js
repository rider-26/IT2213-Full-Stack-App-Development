// routes/index.js
// (RECONSTRUCTED - this is just the file that connects all the different
// use case routes together. app.js does app.use('/api', routes) so
// everything below ends up under /api/...)

const express = require('express');
const router = express.Router();
const payPeriodService = require('../services/payPeriodService');

// GET /api/pay-periods -> used by the pay period dropdown on the frontend
router.get('/pay-periods', async (req, res, next) => {
  try {
    const periods = await payPeriodService.listPayPeriods();
    res.json(periods);
  } catch (err) {
    next(err);
  }
});

// UC-001's roster routes (swap the require path if andre's file is named differently)
router.use('/roster', require('./roster'));

// UC-002 routes (mine)
router.use('/validation', require('./validation'));

module.exports = router;
