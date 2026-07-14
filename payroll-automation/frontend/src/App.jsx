import React from 'react';
import DashboardPage from './pages/DashboardPage.jsx';

// DashboardPage owns the shared nav that switches between each use case's page.
function App() {
  return <DashboardPage />;
// Top-level app shell. Only the Approval page (UC-004) is wired up so far;
// teammates will add their own pages/routes here as they finish their use cases.
import ApprovalPage from "./pages/ApprovalPage";

function App() {
  return (
    <div className="app-container">
      <h1>Payroll Automation</h1>
      <p className="app-subtitle">UC-004 &mdash; Review &amp; Approve Payroll</p>
      <ApprovalPage />
    </div>
  );
}

export default App;
