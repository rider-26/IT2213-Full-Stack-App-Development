// Sets up the Express application: middleware + routes.
// server.js is what actually starts it listening on a port.

const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
