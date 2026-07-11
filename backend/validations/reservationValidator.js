const { body } = require('express-validator');
const { validate } = require('./authValidator');

const createReservationRules = [
  body('service_id')
    .isInt({ min: 1 })
    .withMessage('ID de service invalide'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Les notes ne peuvent pas dépasser 1000 caractères'),
];

module.exports = { createReservationRules, validate };
