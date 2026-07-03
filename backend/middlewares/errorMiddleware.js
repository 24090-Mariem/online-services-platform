const errorHandler = (err, req, res, next) => {
  const statusCode = Number(err.statusCode) || 500;

  if (statusCode === 500) {
    console.error('[ERROR]', err);
  }

  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Erreur interne du serveur'
    : err.message || 'Erreur interne du serveur';

  const payload = {
    success: false,
    message,
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
