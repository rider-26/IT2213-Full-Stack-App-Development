// UC-004: Review & Approve Payroll page.
// Fetches payroll records pending approval and lets the manager approve/reject them.
import { useEffect, useState } from "react";
import ApprovalSummary from "../components/ApprovalSummary";
import { getPendingApprovals, approvePayroll, rejectPayroll } from "../api/client";

function ApprovalPage() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function loadRecords() {
    try {
      const data = await getPendingApprovals();
      setRecords(data.records);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function handleApprove(id) {
    setError(null);
    try {
      const data = await approvePayroll(id, "Managing Director");
      setMessage(data.message);
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(id, comment) {
    setError(null);
    if (!comment || comment.trim() === "") {
      setError("Please enter a comment before rejecting.");
      return;
    }
    try {
      const data = await rejectPayroll(id, "Managing Director", comment);
      setMessage(data.message);
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="approval-page">
      <h2>Payroll Pending Approval</h2>
      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}
      <ApprovalSummary records={records} onApprove={handleApprove} onReject={handleReject} />
    </div>
  );
}

export default ApprovalPage;
