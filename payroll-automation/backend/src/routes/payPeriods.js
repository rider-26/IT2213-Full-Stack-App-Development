// Routes for listing/looking up pay periods (supporting UC-001 onward).

const express = require('express');
const payPeriodController = require('../controllers/payPeriodController');

const router = express.Router();

router.get('/', payPeriodController.listPayPeriods);
router.get('/:id', payPeriodController.getPayPeriod);

module.exports = router;
