// Sets up the Express application: middleware + routes.
// server.js is what actually starts it listening on a port.

const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
// Express app setup: middleware + routes. Kept minimal for now.
const express = require("express");
const cors = require("cors");
const routes = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());

// Friendly landing response so opening http://localhost:5000 in a browser
// doesn't show "Cannot GET /" — the real endpoints live under /api.
app.get('/', (req, res) => {
  res.json({
    name: 'Payroll Automation API',
    endpoints: ['/api/pay-periods', '/api/roster'],
  });
});

app.use('/api', routes);
app.use(errorHandler);
app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Payroll Automation API is running" });
});

// Basic error handler - catches anything that wasn't handled in a controller.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "SERVER_ERROR", message: "Something went wrong" });
});

module.exports = app;
