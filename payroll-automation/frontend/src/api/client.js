// Small helper functions for talking to the roster sync backend (UC-001).

const ROSTER_BASE_URL = '/api/roster';

export async function fetchPayPeriods() {
  const response = await fetch('/api/pay-periods');
  const data = await response.json();
  return data.payPeriods;
}

export async function fetchSyncSummary(payPeriodId) {
  const url = payPeriodId
    ? `${ROSTER_BASE_URL}/sync/summary?payPeriodId=${encodeURIComponent(payPeriodId)}`
    : `${ROSTER_BASE_URL}/sync/summary`;
  const response = await fetch(url);
  return response.json();
}

export async function triggerImportNow(payPeriodId) {
  const response = await fetch(`${ROSTER_BASE_URL}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payPeriodId }),
  });
  return response.json();
}

// Demo helper: forces the "sheet unreachable" error path (alt flow 1b)
// without needing to break .env and restart the backend mid-demo.
export async function simulateSheetDown(payPeriodId) {
  const response = await fetch(`${ROSTER_BASE_URL}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payPeriodId, simulateFailure: true }),
  });
  return response.json();
}

export async function fetchSyncHistory(payPeriodId) {
  const url = payPeriodId
    ? `${ROSTER_BASE_URL}/sync/history?payPeriodId=${encodeURIComponent(payPeriodId)}`
    : `${ROSTER_BASE_URL}/sync/history`;
  const response = await fetch(url);
  const data = await response.json();
  return data.history;
}
