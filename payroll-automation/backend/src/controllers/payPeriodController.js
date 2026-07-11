// Handles HTTP requests for listing/looking up pay periods.

const payPeriodService = require('../services/payPeriodService');

// GET /api/pay-periods — lets the frontend populate a period selector.
async function listPayPeriods(req, res, next) {
  try {
    const payPeriods = await payPeriodService.listPayPeriods();
    res.status(200).json({ payPeriods });
  } catch (err) {
    next(err);
  }
}

// GET /api/pay-periods/:id
async function getPayPeriod(req, res, next) {
  try {
    const payPeriod = await payPeriodService.getPayPeriod(req.params.id);

    if (!payPeriod) {
      return res.status(404).json({
        error: 'PAY_PERIOD_NOT_FOUND',
        message: `No pay period with id ${req.params.id}`,
      });
    }

    res.status(200).json(payPeriod);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPayPeriods, getPayPeriod };
