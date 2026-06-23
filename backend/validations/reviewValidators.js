const { body } = require('express-validator');

exports.createReviewValidation = [
  body('reservation_id')
    .isInt({ min: 1 })
    .withMessage('ID de réservation invalide'),
  body('technicien_id')
    .isInt({ min: 1 })
    .withMessage('ID du technicien invalide'),
  body('note')
    .isInt({ min: 0, max: 10 })
    .withMessage('La note doit être comprise entre 0 et 10'),
  body('commentaire')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
];

exports.updateReviewValidation = [
  body('note')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('La note doit être comprise entre 0 et 10'),
  body('commentaire')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
];
