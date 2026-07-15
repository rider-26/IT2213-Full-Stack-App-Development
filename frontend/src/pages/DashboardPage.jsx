import React, { useState } from 'react';
import RosterSyncPage from './RosterSyncPage.jsx';
import ValidateTimesheetsPage from './ValidateTimesheetsPage.jsx';

// DashboardPage.jsx
// (RECONSTRUCTED - App.jsx said this file handles switching between each
// use case's page, so made this to do that. swap RosterSyncPage import
// with whatever andre actually named his file if its different)

const PAGES = [
  { id: 'roster', label: 'Roster Sync', Component: RosterSyncPage },
  { id: 'validate', label: 'Validate Timesheets', Component: ValidateTimesheetsPage },
];

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('roster');
  const current = PAGES.find((p) => p.id === activePage);
  const ActiveComponent = current.Component;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#8A8D99', letterSpacing: '0.05em', marginBottom: 16 }}>
          PAYROLL AUTOMATION
        </div>
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePage(p.id)}
            style={{
              ...navButtonStyle,
              background: activePage === p.id ? '#EEF1FE' : 'transparent',
              color: activePage === p.id ? '#2F5CF0' : '#4B4F5A',
              fontWeight: activePage === p.id ? 700 : 500,
            }}
          >
            {p.label}
          </button>
        ))}
      </nav>
      <main style={{ flex: 1 }}>
        <ActiveComponent />
      </main>
    </div>
  );
}

const navStyle = {
  width: 220,
  minWidth: 220,
  background: '#fff',
  borderRight: '1px solid #EDEBF3',
  padding: '24px 16px',
};

const navButtonStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  border: 'none',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  cursor: 'pointer',
  marginBottom: 4,
};
