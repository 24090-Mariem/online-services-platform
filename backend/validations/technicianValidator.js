const { body } = require('express-validator');

const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
};

const NAME_RULES = {
  minLength: 1,
  maxLength: 100,
  pattern: /^[\p{L}\s\-']+$/u,
};

const TELEPHONE_RULES = {
  pattern: /^[+\d][\d\s\-().]{6,20}$/,
};

const createTechnicienRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: NAME_RULES.minLength, max: NAME_RULES.maxLength }).withMessage(`Le nom doit contenir entre ${NAME_RULES.minLength} et ${NAME_RULES.maxLength} caractères`)
    .matches(NAME_RULES.pattern).withMessage('Le nom contient des caractères non autorisés'),
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: NAME_RULES.minLength, max: NAME_RULES.maxLength }).withMessage(`Le prénom doit contenir entre ${NAME_RULES.minLength} et ${NAME_RULES.maxLength} caractères`)
    .matches(NAME_RULES.pattern).withMessage('Le prénom contient des caractères non autorisés'),
  body('email')
    .trim()
    .isEmail().withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email trop long'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: PASSWORD_RULES.minLength }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .isLength({ max: PASSWORD_RULES.maxLength }).withMessage('Le mot de passe ne doit pas dépasser 128 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir un caractère spécial'),
  body('telephone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(TELEPHONE_RULES.pattern).withMessage('Format de téléphone invalide'),
  body('adresse')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('L\'adresse ne doit pas dépasser 255 caractères'),
  body('specialite')
    .trim()
    .notEmpty().withMessage('La spécialité est requise')
    .isLength({ max: 100 }).withMessage('La spécialité ne doit pas dépasser 100 caractères'),
];

const submitDemandeRules = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: NAME_RULES.minLength, max: 100 }).withMessage(`Le nom doit contenir entre ${NAME_RULES.minLength} et 100 caractères`)
    .matches(NAME_RULES.pattern).withMessage('Le nom contient des caractères non autorisés'),
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: NAME_RULES.minLength, max: 100 }).withMessage(`Le prénom doit contenir entre ${NAME_RULES.minLength} et 100 caractères`)
    .matches(NAME_RULES.pattern).withMessage('Le prénom contient des caractères non autorisés'),
  body('email')
    .trim()
    .isEmail().withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email trop long'),
  body('telephone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(TELEPHONE_RULES.pattern).withMessage('Format de téléphone invalide'),
  body('specialite')
    .trim()
    .notEmpty().withMessage('La spécialité est requise')
    .isLength({ max: 100 }).withMessage('La spécialité ne doit pas dépasser 100 caractères'),
];

module.exports = { createTechnicienRules, submitDemandeRules };
