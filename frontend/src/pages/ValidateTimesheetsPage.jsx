import React, { useState, useEffect, useCallback } from 'react';
import './ValidateTimesheetsPage.css';

// this is the UC-002 page - validate timesheets
// tried to copy the same layout as the roster sync page (header, description,
// pay period dropdown, buttons, stat cards, then a table you can expand)

// quick note on the api calls below in case i forget later:
// GET  /api/validation/:payPeriodId/review  -> gets the current state
// POST /api/validation/:payPeriodId/run     -> runs the checks again
// POST /api/validation/flags/:flagId/resolve
// POST /api/validation/flags/:flagId/escalate
// POST /api/validation/:payPeriodId/mark-validated

const STATUS_STYLES = {
  Matched: { bg: '#DCFCE7', fg: '#15803D', dot: '#22C55E' },
  Flagged: { bg: '#FEF3C7', fg: '#B45309', dot: '#F59E0B' },
  Escalated: { bg: '#FEE2E2', fg: '#B91C1C', dot: '#EF4444' },
  Validated: { bg: '#DCFCE7', fg: '#15803D', dot: '#22C55E' },
};

// little colored badge thing, reused a few times below
function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Flagged;
  return (
    <span className="vt-pill" style={{ background: s.bg, color: s.fg }}>
      <span className="vt-pill-dot" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

export default function ValidateTimesheetsPage() {
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedStaff, setExpandedStaff] = useState(null); // which staff row is opened up
  const [actingOnFlag, setActingOnFlag] = useState(null); // which flag we're currently resolving
  const [correctedHours, setCorrectedHours] = useState('');
  const [notes, setNotes] = useState('');

  // grab the list of pay periods for the dropdown at the top
  const loadPeriods = useCallback(async () => {
    const res = await fetch('/api/pay-periods');
    const json = await res.json();
    setPayPeriods(json);
    if (json.length && !selectedPeriod) {
      // default to whichever period is marked as "current", otherwise just pick the first
      const current = json.find((p) => p.current) || json[0];
      setSelectedPeriod(current.id);
    }
  }, [selectedPeriod]);

  // grabs the actual review data (staff list, flags, stats etc) for whichever period is picked
  const loadReview = useCallback(async () => {
    if (!selectedPeriod) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/validation/${selectedPeriod}/review`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => { loadPeriods(); }, [loadPeriods]);
  useEffect(() => { loadReview(); }, [loadReview]);

  // clicking "run validation" button
  async function runValidation() {
    setLoading(true);
    await fetch(`/api/validation/${selectedPeriod}/run`, { method: 'POST' });
    await loadReview(); // refresh after
  }

  // confirm or correct a flag
  async function resolveFlag(flagId, resolution) {
    await fetch(`/api/validation/flags/${flagId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolution,
        correctedHours: correctedHours ? Number(correctedHours) : undefined,
        notes,
      }),
    });
    setActingOnFlag(null);
    setCorrectedHours('');
    setNotes('');
    loadReview();
  }

  // send a flag up to the managing director
  async function escalateFlag(flagId) {
    await fetch(`/api/validation/flags/${flagId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setActingOnFlag(null);
    setNotes('');
    loadReview();
  }

  // the "im done, lock it in" button
  async function markValidated() {
    const res = await fetch(`/api/validation/${selectedPeriod}/mark-validated`, { method: 'POST' });
    if (res.ok) loadReview();
  }

  const staffList = data?.staff || [];
  // counts how many flags are still open/escalated - used to disable the validate button
  const blockingCount = staffList.reduce(
    (n, s) => n + (s.flags || []).filter((f) => f.status === 'OPEN' || f.status === 'ESCALATED').length,
    0
  );

  return (
    <div className="vt-page">
      <h1 className="vt-title">Validate Timesheets</h1>
      <p className="vt-description">
        Cross-checks each staff member's captured hours against their approved roster for the selected
        pay period, flags anomalies — overtime, missing entries, duplicate records — and consolidates
        confirmed hours into a validated timesheet ready for payroll calculation.
      </p>

      <div className="vt-controls">
        <div>
          <label className="vt-label">Pay Period</label>
          <select
            className="vt-select"
            value={selectedPeriod || ''}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {payPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.start_date} – {p.end_date}{p.current ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="vt-actions">
        <button className="vt-btn-primary" onClick={runValidation}>Run Validation</button>
        <button
          className="vt-btn-secondary"
          onClick={markValidated}
          disabled={blockingCount > 0 || data?.status === 'VALIDATED'}
        >
          {data?.status === 'VALIDATED' ? 'Validated ✓' : 'Mark Period Validated'}
        </button>
      </div>

      {/* the 4 little stat boxes at the top, same as roster sync page */}
      <div className="vt-stats">
        <div className="vt-stat-card">
          <div className="vt-stat-label">STAFF REVIEWED</div>
          <div className="vt-stat-value">{data?.staffReviewed ?? '—'}</div>
        </div>
        <div className="vt-stat-card">
          <div className="vt-stat-label">TOTAL HOURS VALIDATED</div>
          <div className="vt-stat-value">{data?.totalHoursValidated ?? '—'}</div>
        </div>
        <div className="vt-stat-card">
          <div className="vt-stat-label">DISCREPANCIES FLAGGED</div>
          <div className="vt-stat-value vt-stat-accent">{data?.discrepancyCount ?? '—'}</div>
        </div>
        <div className="vt-stat-card">
          <div className="vt-stat-label">LAST VALIDATED</div>
          <div className="vt-stat-value vt-stat-small">{data?.lastValidatedAt || '—'}</div>
        </div>
      </div>

      <div className="vt-table-card">
        <div className="vt-table-header">
          <h2>Discrepancy Review</h2>
          <span className="vt-table-count">{staffList.length} staff</span>
        </div>

        <div className="vt-table-columns">
          <span>STAFF ID</span>
          <span>NAME</span>
          <span>STATUS</span>
          <span>TOTAL HOURS</span>
          <span>FLAGS</span>
        </div>

        {loading && <div className="vt-empty">Loading…</div>}
        {!loading && staffList.length === 0 && <div className="vt-empty">No timesheet data for this period yet.</div>}

        {/* one row per staff member, click to expand and see their individual entries */}
        {staffList.map((s) => {
          const isOpen = expandedStaff === s.staffId;
          const flagCount = (s.flags || []).length;
          return (
            <div key={s.staffId} className="vt-staff-group">
              <button className="vt-staff-row" onClick={() => setExpandedStaff(isOpen ? null : s.staffId)}>
                <span>{s.staffId}</span>
                <span>{s.name}</span>
                <span><StatusPill status={s.status} /></span>
                <span>{s.totalHours}</span>
                <span className="vt-flag-count">{isOpen ? '▲' : '▼'} {flagCount}</span>
              </button>

              {isOpen && (
                <div className="vt-entries">
                  <div className="vt-entries-columns">
                    <span>DATE</span>
                    <span>SCHEDULED</span>
                    <span>ACTUAL</span>
                    <span>ISSUE</span>
                    <span></span>
                  </div>
                  {(s.entries || []).map((e, i) => {
                    // match this entry up with its flag if it has one
                    const flag = (s.flags || []).find((f) => f.entryId === e.id);
                    return (
                      <div key={i} className="vt-entry-row">
                        <span>{e.date}</span>
                        <span>{e.scheduledHours ?? '—'}</span>
                        <span>{e.actualHours ?? '—'}</span>
                        <span>
                          {flag ? (
                            <span className="vt-issue-tag">{flag.label}</span>
                          ) : (
                            <span className="vt-ok-tag">OK</span>
                          )}
                        </span>
                        <span>
                          {/* show a review button if its still open, otherwise just show the status */}
                          {flag && flag.status === 'OPEN' && actingOnFlag !== flag.id && (
                            <button className="vt-review-btn" onClick={() => setActingOnFlag(flag.id)}>Review</button>
                          )}
                          {flag && flag.status !== 'OPEN' && (
                            <StatusPill status={flag.status === 'RESOLVED' ? 'Validated' : 'Escalated'} />
                          )}
                        </span>
                      </div>
                    );
                  })}

                  {/* little popup box for actually resolving/escalating a flag */}
                  {actingOnFlag && (s.flags || []).some((f) => f.id === actingOnFlag) && (
                    <div className="vt-resolve-panel">
                      <input
                        className="vt-input"
                        placeholder="Corrected hours (if applicable)"
                        value={correctedHours}
                        onChange={(e) => setCorrectedHours(e.target.value)}
                      />
                      <input
                        className="vt-input"
                        placeholder="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div className="vt-resolve-actions">
                        <button className="vt-btn-primary vt-btn-sm" onClick={() => resolveFlag(actingOnFlag, 'CONFIRMED')}>Confirm hours</button>
                        <button className="vt-btn-dark vt-btn-sm" onClick={() => resolveFlag(actingOnFlag, 'CORRECTED')}>Save correction</button>
                        <button className="vt-btn-danger vt-btn-sm" onClick={() => escalateFlag(actingOnFlag)}>Escalate to Director</button>
                        <button className="vt-btn-ghost vt-btn-sm" onClick={() => setActingOnFlag(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
