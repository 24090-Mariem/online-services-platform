const { body } = require('express-validator');

const createAdminRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 1, max: 100 }).withMessage('Le nom doit contenir entre 1 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿa-zA-Z\s\-']+$/).withMessage('Le nom contient des caractères non autorisés'),
  body('email')
    .trim()
    .isEmail().withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email trop long'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .isLength({ max: 128 }).withMessage('Le mot de passe ne doit pas dépasser 128 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir un caractère spécial'),
];

module.exports = { createAdminRules };
