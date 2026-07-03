const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const NAME_PATTERN = /^[a-zA-ZÀ-ÿa-zA-Z\s\-']+$/;
const TELEPHONE_PATTERN = /^[+\d][\d\s\-().]{6,20}$/;

const registerRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email trop long'),
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .isLength({ max: 128 }).withMessage('Le mot de passe ne doit pas dépasser 128 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir un caractère spécial'),
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 1, max: 100 }).withMessage('Le nom doit contenir entre 1 et 100 caractères')
    .matches(NAME_PATTERN).withMessage('Le nom contient des caractères non autorisés'),
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 1, max: 100 }).withMessage('Le prénom doit contenir entre 1 et 100 caractères')
    .matches(NAME_PATTERN).withMessage('Le prénom contient des caractères non autorisés'),
  body('telephone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(TELEPHONE_PATTERN).withMessage('Format de téléphone invalide'),
];

const loginRules = [
  body('email')
    .trim()
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
    .trim()
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('token')
    .notEmpty().withMessage('Token requis'),
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .isLength({ max: 128 }).withMessage('Le mot de passe ne doit pas dépasser 128 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir un caractère spécial'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, validate };
