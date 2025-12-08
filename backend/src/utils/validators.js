export function requireFields(obj, fields) {
  const missing = fields.filter(f => {
    const v = obj[f];
    return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
  });
  if (missing.length) {
    const e = new Error(`Missing required fields: ${missing.join(', ')}`);
    e.status = 400;
    e.publicMessage = `Missing required fields: ${missing.join(', ')}`;
    throw e;
  }
}

export function isArrayNonEmpty(arr, name = 'items') {
  if (!Array.isArray(arr) || arr.length === 0) {
    const e = new Error(`${name} required`);
    e.status = 400;
    e.publicMessage = `${name} required`;
    throw e;
  }
}