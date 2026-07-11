// Catches anything an async controller passed to next(err) — e.g. an
// unexpected database error — so the server returns a clean 500 instead
// of crashing or hanging the request.
function errorHandler(err, req, res, next) {
  console.error('[errorHandler]', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' });
}

module.exports = errorHandler;
