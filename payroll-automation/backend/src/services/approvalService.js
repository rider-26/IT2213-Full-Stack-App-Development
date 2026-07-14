// Business logic for UC-004: Review & Approve Payroll.
const Approval = require("../models/Approval");

function listPendingApprovals() {
  return Approval.getAll().filter((record) => record.status === "pending_approval");
}

function approveRecord(id, approvedBy) {
  const record = Approval.findById(id);
  if (!record) {
    return { error: "NOT_FOUND", message: `No payroll record found with id ${id}` };
  }
  if (record.status !== "pending_approval") {
    return { error: "INVALID_STATUS", message: `Record is already "${record.status}", cannot approve again` };
  }

  record.status = "approved";
  record.approvedBy = approvedBy || "Managing Director";
  record.decidedAt = new Date().toISOString();
  record.comment = null;

  return { record };
}

function rejectRecord(id, approvedBy, comment) {
  const record = Approval.findById(id);
  if (!record) {
    return { error: "NOT_FOUND", message: `No payroll record found with id ${id}` };
  }
  if (!comment || comment.trim() === "") {
    return { error: "COMMENT_REQUIRED", message: "A comment is required to reject a payroll record" };
  }
  if (record.status !== "pending_approval") {
    return { error: "INVALID_STATUS", message: `Record is already "${record.status}", cannot reject again` };
  }

  record.status = "rejected";
  record.approvedBy = approvedBy || "Managing Director";
  record.decidedAt = new Date().toISOString();
  record.comment = comment;

  return { record };
}

module.exports = { listPendingApprovals, approveRecord, rejectRecord };
