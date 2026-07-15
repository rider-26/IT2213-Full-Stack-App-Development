// errorHandler.js
// (RECONSTRUCTED - just a normal express error handler, catches anything
// that goes wrong in the routes and turns it into a proper json response
// instead of crashing the whole server)

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong',
  });
}

module.exports = errorHandler;
