const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const sanitizePlainText = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>"'&]/g, '');
};

const sanitizeObject = (obj, fields, mode = 'plain') => {
  const fn = mode === 'html' ? sanitizeHtml : sanitizePlainText;
  const sanitized = { ...obj };
  for (const field of fields) {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      sanitized[field] = fn(String(sanitized[field]));
    }
  }
  return sanitized;
};

module.exports = {
  sanitizeHtml,
  sanitizePlainText,
  sanitizeObject,
};
