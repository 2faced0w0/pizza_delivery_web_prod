// Centralized error handler with consistent shape
export function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'SERVER_ERROR';
  const message = err.publicMessage || err.message || 'Unexpected server error';

  // Log full error for diagnostics
  console.error('[error]', {
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message,
    stack: err.stack,
  });

  if (res.headersSent) return next(err);
  res.status(status).json({
    success: false,
    error: { code, message },
  });
}

// Helper to create HTTP errors
export function httpError(status, message, code = undefined) {
  const e = new Error(message);
  e.status = status;
  if (code) e.code = code;
  e.publicMessage = message;
  return e;
}
