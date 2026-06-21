const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const registerRules = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir un caractère spécial'),
  body('nom')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Le nom est requis'),
  body('prenom')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Le prénom est requis'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 'Erreur de validation', 400, formatted);
  }
  next();
};

const forgotPasswordRules = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('token')
    .notEmpty().withMessage('Token requis'),
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir un caractère spécial'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, validate };
