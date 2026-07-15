// validation.js
// these are the actual endpoints for UC-002. this file doesnt really do any
// logic itself, it just calls the right function in validationService.js and
// sends back whatever it gets. keeping it dumb on purpose so if somethings
// broken i know to look in the service file not here

const express = require('express');
const router = express.Router();
const validationService = require('../services/validationService');

// GET /api/validation/:payPeriodId/review -> just shows current state, doesnt change anything
router.get('/:payPeriodId/review', async (req, res) => {
  const result = await validationService.getReview(req.params.payPeriodId);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/validation/:payPeriodId/run -> actually runs the discrepancy checks
router.post('/:payPeriodId/run', async (req, res) => {
  const result = await validationService.runValidation(req.params.payPeriodId);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/validation/flags/:flagId/resolve -> supervisor confirms/fixes a flagged entry
router.post('/flags/:flagId/resolve', async (req, res) => {
  const result = await validationService.resolveFlag(req.params.flagId, req.body);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/validation/flags/:flagId/escalate -> sends it up to the managing director
router.post('/flags/:flagId/escalate', async (req, res) => {
  const result = await validationService.escalateFlag(req.params.flagId, req.body);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/validation/:payPeriodId/mark-validated -> final step, locks it in
router.post('/:payPeriodId/mark-validated', async (req, res) => {
  const result = await validationService.markValidated(req.params.payPeriodId);
  if (!result.success) {
    // 409 = conflict, basically "cant do that right now" cus theres unresolved flags
    return res.status(409).json(result);
  }
  res.json(result);
});

module.exports = router;
