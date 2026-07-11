// UC-001: Reads roster rows from the real Google Sheet.
// The sheet is published to the web as CSV (File > Share > Publish to web),
// and this just fetches and parses that CSV — no Google Cloud credentials
// needed. The sheet's first row must be headers: Staff ID, Staff Name,
// Date, Clock In, Clock Out.

const { parse } = require('csv-parse/sync');

async function getRosterRows() {
  const csvUrl = process.env.ROSTER_SHEET_CSV_URL;
  if (!csvUrl) {
    throw new Error('ROSTER_SHEET_CSV_URL is not set — see .env.example');
  }

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Google Sheet request failed with HTTP ${response.status}`);
  }
  const csvText = await response.text();

  const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

  return records.map((record) => ({
    staffId: record['Staff ID'],
    staffName: record['Staff Name'],
    date: record['Date'],
    clockIn: record['Clock In'],
    clockOut: record['Clock Out'],
  }));
}

module.exports = { getRosterRows };
