// UC-001 main flow step 1: "On its schedule (nightly), the system reads
// the roster rows from the Google Sheet." This is the automatic path —
// "Import Now" (rosterController.importNow) is the manual fallback
// described in alt flow 1a, for when staff need fresher data sooner.

const rosterSyncService = require('../services/rosterSyncService');

const SYNC_HOURS = [0, 11]; // run at 00:00 (midnight) and 11:00 (11am)
const CHECK_INTERVAL_MS = 60 * 1000; // check the clock once a minute

const alreadyRunSlots = new Set(); // "date-hour" keys already synced, so each scheduled hour only fires once per day

// Runs the sync the first time the clock reaches one of SYNC_HOURS, once
// per scheduled hour per day. Takes `now` as a parameter so it can be
// tested without waiting for the real clock to hit a scheduled hour.
function runIfDue(now = new Date()) {
  const currentHour = now.getHours();
  if (!SYNC_HOURS.includes(currentHour)) return;

  const slotKey = `${now.toDateString()}-${currentHour}`;
  if (alreadyRunSlots.has(slotKey)) return;

  alreadyRunSlots.add(slotKey);
  console.log(`[rosterSyncScheduler] Running scheduled roster sync (${currentHour}:00)...`);
  rosterSyncService.runRosterSync(undefined, 'scheduler').catch((err) => {
    console.error('[rosterSyncScheduler] Scheduled sync failed:', err.message);
  });
}

function start() {
  const schedule = SYNC_HOURS.map((hour) => `${hour}:00`).join(' and ');
  console.log(`[rosterSyncScheduler] Roster sync scheduled for ${schedule} daily.`);
  setInterval(() => runIfDue(), CHECK_INTERVAL_MS);
}

module.exports = { start, runIfDue };