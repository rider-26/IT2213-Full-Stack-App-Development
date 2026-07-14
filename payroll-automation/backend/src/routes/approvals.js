// UC-004: Review & Approve Payroll
const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approvalController");

router.get("/", approvalController.getApprovals);
router.post("/:id/approve", approvalController.approveApproval);
router.post("/:id/reject", approvalController.rejectApproval);

module.exports = router;
