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

// ── Auth + payroll helpers (UC-003) ────────────────────────────────────
// The payroll endpoints require a login, so these helpers attach the JWT
// from localStorage as a Bearer token, and return { ok, status, data } so
// pages can branch on 401/404/409 instead of only seeing parsed JSON.

const TOKEN_KEY = 'accessToken';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function authedFetch(path, options = {}) {
  const token = getAccessToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export function registerUser(body) {
  return authedFetch('/api/user/register', { method: 'POST', body: JSON.stringify(body) });
}

export function loginUser(body) {
  return authedFetch('/api/user/login', { method: 'POST', body: JSON.stringify(body) });
}

export function fetchCurrentUser() {
  return authedFetch('/api/user/auth');
}

// UC-003: periods WITH status (the plain /api/pay-periods list has no
// status, and the payroll page needs to know which ones are 'validated').
export function fetchPayrollPeriods() {
  return authedFetch('/api/payroll/periods/list');
}

export function calculatePayroll(payPeriodId) {
  return authedFetch('/api/payroll/calculate', {
    method: 'POST',
    body: JSON.stringify({ payPeriodId }),
  });
}

export function fetchPayrollForPeriod(payPeriodId) {
  return authedFetch(`/api/payroll/${encodeURIComponent(payPeriodId)}`);
}
