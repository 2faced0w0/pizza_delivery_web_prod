export function ok(res, data = null, meta = undefined) {
  res.status(200).json({ success: true, data, meta });
}

export function created(res, data = null, meta = undefined) {
  res.status(201).json({ success: true, data, meta });
}

export function noContent(res) {
  res.status(204).send();
}

export function badRequest(message = 'Invalid request', code = 'BAD_REQUEST') {
  const e = new Error(message);
  e.status = 400;
  e.code = code;
  e.publicMessage = message;
  throw e;
}

export function unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
  const e = new Error(message);
  e.status = 401;
  e.code = code;
  e.publicMessage = message;
  throw e;
}

export function forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
  const e = new Error(message);
  e.status = 403;
  e.code = code;
  e.publicMessage = message;
  throw e;
}

export function notFound(message = 'Not found', code = 'NOT_FOUND') {
  const e = new Error(message);
  e.status = 404;
  e.code = code;
  e.publicMessage = message;
  throw e;
}