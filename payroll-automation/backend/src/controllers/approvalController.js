// Handles HTTP request/response for UC-004; the actual logic lives in approvalService.
const approvalService = require("../services/approvalService");

function getApprovals(req, res) {
  const records = approvalService.listPendingApprovals();
  res.json({ records });
}

function approveApproval(req, res) {
  const { id } = req.params;
  const { approvedBy } = req.body;

  const result = approvalService.approveRecord(id, approvedBy);
  if (result.error) {
    const statusCode = result.error === "NOT_FOUND" ? 404 : 409;
    return res.status(statusCode).json(result);
  }

  res.json({ message: `Payroll for ${result.record.staffName} approved.`, record: result.record });
}

function rejectApproval(req, res) {
  const { id } = req.params;
  const { approvedBy, comment } = req.body;

  const result = approvalService.rejectRecord(id, approvedBy, comment);
  if (result.error) {
    const statusCode = result.error === "NOT_FOUND" ? 404 : result.error === "COMMENT_REQUIRED" ? 422 : 409;
    return res.status(statusCode).json(result);
  }

  res.json({ message: `Payroll for ${result.record.staffName} rejected.`, record: result.record });
}

module.exports = { getApprovals, approveApproval, rejectApproval };
