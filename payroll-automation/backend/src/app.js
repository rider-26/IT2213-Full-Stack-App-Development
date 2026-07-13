// Sets up the Express application: middleware + routes.
// server.js is what actually starts it listening on a port.

const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

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

module.exports = app;
