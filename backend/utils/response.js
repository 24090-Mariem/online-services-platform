const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

const respondData = (res, data, message = 'Succès') => {
  return sendSuccess(res, data, message, 200);
};

const respondMessage = (res, message, statusCode = 200, data = null) => {
  return sendSuccess(res, data, message, statusCode);
};

const respondNotFound = (res, message = 'Ressource introuvable') => {
  return sendError(res, message, 404);
};

const respondBadRequest = (res, errors) => {
  if (Array.isArray(errors)) {
    return sendError(res, 'Données invalides', 400, errors);
  }
  return sendError(res, errors || 'Données invalides', 400);
};

const respondForbidden = (res, message = 'Accès refusé') => {
  return sendError(res, message, 403);
};

module.exports = { sendSuccess, sendError, respondData, respondMessage, respondNotFound, respondBadRequest, respondForbidden };
