// Shows the list of payroll records waiting for approval, with Approve/Reject buttons.
import { useState } from "react";

function ApprovalSummary({ records, onApprove, onReject }) {
  const [commentDrafts, setCommentDrafts] = useState({});

  function handleCommentChange(id, value) {
    setCommentDrafts((prev) => ({ ...prev, [id]: value }));
  }

  if (records.length === 0) {
    return <p className="empty-state">No payroll records are waiting for approval right now.</p>;
  }

  return (
    <table className="approval-table">
      <thead>
        <tr>
          <th>Staff</th>
          <th>Pay Period</th>
          <th>Gross Pay</th>
          <th>Deductions</th>
          <th>Net Pay</th>
          <th>Reject Comment</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td>{record.staffName}</td>
            <td>{record.payPeriod}</td>
            <td className="amount">${record.grossPay.toFixed(2)}</td>
            <td className="amount">${record.deductions.toFixed(2)}</td>
            <td className="amount">${record.netPay.toFixed(2)}</td>
            <td>
              <input
                type="text"
                className="comment-input"
                placeholder="Required if rejecting"
                value={commentDrafts[record.id] || ""}
                onChange={(e) => handleCommentChange(record.id, e.target.value)}
              />
            </td>
            <td className="actions-cell">
              <button className="btn btn-approve" onClick={() => onApprove(record.id)}>
                Approve
              </button>
              <button className="btn btn-reject" onClick={() => onReject(record.id, commentDrafts[record.id])}>
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApprovalSummary;
