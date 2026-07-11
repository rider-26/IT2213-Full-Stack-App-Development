import React, { useState, useEffect } from 'react';
import {
  fetchPayPeriods,
  fetchSyncSummary,
  triggerImportNow,
  simulateSheetDown,
  fetchSyncHistory,
} from '../api/client';
import SyncSummaryCard from '../components/SyncSummaryCard';
import ExceptionList from '../components/ExceptionList';
import SyncHistoryList from '../components/SyncHistoryList';

// UC-001 page: accounting staff can pick a pay period, trigger a manual
// roster sync for it, and see the results — sync summary, per-staff shift
// breakdown, unmatched/data-issue entries, and recent sync history.
function RosterSyncPage() {
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [expandedStaffId, setExpandedStaffId] = useState(null);

  function refreshSummaryAndHistory(payPeriodId) {
    fetchSyncSummary(payPeriodId).then(setSummary);
    fetchSyncHistory(payPeriodId).then(setHistory);
  }

  // On load: get the list of pay periods, default to the current one, and
  // show whatever the last sync produced for it.
  useEffect(() => {
    fetchPayPeriods().then((periods) => {
      setPayPeriods(periods);
      const defaultPeriod = periods.find((period) => period.isActive) || periods[0];
      if (defaultPeriod) {
        setSelectedPayPeriodId(defaultPeriod.id);
        refreshSummaryAndHistory(defaultPeriod.id);
      }
    });
  }, []);

  function handlePayPeriodChange(event) {
    const payPeriodId = event.target.value;
    setSelectedPayPeriodId(payPeriodId);
    setErrorMessage(null);
    setExpandedStaffId(null);
    refreshSummaryAndHistory(payPeriodId);
  }

  async function handleImportNow() {
    setLoading(true);
    setErrorMessage(null);

    const result = await triggerImportNow(selectedPayPeriodId);
    applySyncResult(result);
  }

  async function handleSimulateSheetDown() {
    setLoading(true);
    setErrorMessage(null);

    const result = await simulateSheetDown(selectedPayPeriodId);
    applySyncResult(result);
  }

  function applySyncResult(result) {
    if (!result.success) {
      // Alt flow: sheet unreachable/empty — show the error, keep old draft on screen.
      setErrorMessage(result.message);
      if (result.previousDraft) {
        setSummary(result.previousDraft);
      }
    } else {
      setSummary(result);
    }

    fetchSyncHistory(selectedPayPeriodId).then(setHistory);
    setLoading(false);
  }

  function toggleExpand(staffId) {
    setExpandedStaffId((current) => (current === staffId ? null : staffId));
  }

  return (
    <div className="page">
      <div className="page-intro">
          <h2>Roster Sync</h2>
          <p className="muted">
            Pulls shift entries from the Google Sheet roster, matches each row to a staff record, and
            totals hours into draft timesheets for the current pay period. Rows that can't be matched
            are flagged below for review.
          </p>
        </div>

        <div className="field-row">
          <label htmlFor="pay-period-select">Pay Period</label>
          <select
            id="pay-period-select"
            value={selectedPayPeriodId || ''}
            onChange={handlePayPeriodChange}
            disabled={loading || payPeriods.length === 0}
          >
            {payPeriods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.startDate} – {period.endDate}
                {period.isActive ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="button-row">
          <button className="primary" onClick={handleImportNow} disabled={loading || !selectedPayPeriodId}>
            {loading && <span className="spinner" />}
            {loading ? 'Syncing…' : 'Import Now'}
          </button>
          <button className="secondary" onClick={handleSimulateSheetDown} disabled={loading || !selectedPayPeriodId}>
            Simulate Sheet Down (Demo)
          </button>
        </div>

        {errorMessage && (
          <div className="banner error-banner">
            <span className="banner-icon" aria-hidden="true">
              ⨯
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        <SyncSummaryCard summary={summary} />

        <div className="card">
          <div className="card-header">
            <h2>Draft Timesheet Totals</h2>
            {summary?.draftTimesheets && (
              <span className="card-count">
                {summary.draftTimesheets.length} {summary.draftTimesheets.length === 1 ? 'staff member' : 'staff'}
              </span>
            )}
          </div>

          {summary && summary.draftTimesheets && summary.draftTimesheets.length > 0 ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th className="numeric">Total Hours</th>
                    <th className="numeric">Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.draftTimesheets.map((timesheet) => {
                    const isExpanded = expandedStaffId === timesheet.staffId;
                    return (
                      <React.Fragment key={timesheet.staffId}>
                        <tr className="row-expandable" onClick={() => toggleExpand(timesheet.staffId)}>
                          <td>{timesheet.staffId}</td>
                          <td>{timesheet.fullName}</td>
                          <td>
                            <span className="badge badge-good">
                              <span className="badge-dot" />
                              Matched
                            </span>
                          </td>
                          <td className="numeric">{timesheet.totalHours}</td>
                          <td className="numeric">
                            <span className="expand-toggle">
                              {isExpanded ? '▲' : '▼'} {timesheet.shifts.length}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="row-breakdown">
                            <td colSpan={5}>
                              <table className="breakdown-table">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th className="numeric">Hours</th>
                                    <th>Matched By</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {timesheet.shifts.map((shift, index) => (
                                    <tr key={index}>
                                      <td>{shift.date}</td>
                                      <td>
                                        {shift.clockIn}–{shift.clockOut}
                                      </td>
                                      <td className="numeric">{shift.hours}</td>
                                      <td>{shift.matchedBy === 'name' ? 'Name (fallback)' : 'Staff ID'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">
              {summary ? 'No draft timesheets yet — run a sync to populate this table.' : 'Loading…'}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Unmatched Entries</h2>
            {summary?.unmatched && <span className="card-count">{summary.unmatched.length} rows</span>}
          </div>
          <ExceptionList items={summary?.unmatched} variant="unmatched" />
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Data Issues</h2>
            {summary?.invalidTime && <span className="card-count">{summary.invalidTime.length} rows</span>}
          </div>
          <ExceptionList items={summary?.invalidTime} variant="invalidTime" />
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Sync History</h2>
          </div>
          <SyncHistoryList history={history} />
        </div>
    </div>
  );
}

export default RosterSyncPage;
