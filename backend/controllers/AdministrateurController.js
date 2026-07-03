const pool = require('../config/db');
const { validationResult } = require('express-validator');
const AdministrateurModel = require('../models/AdministrateurModel');
const PasswordResetModel = require('../models/PasswordResetModel');
const userService = require('../services/userService');
const demandeService = require('../services/demandeService');
const { createNotification } = require('../services/notificationService');
const { sendWelcomeWithLink } = require('../services/emailService');
const { respondData, respondMessage, respondNotFound, respondBadRequest, getPagination, getPaginationMeta } = require('../utils/response');
const { sanitizePlainText } = require('../validations/sanitize');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const users = await userService.list(AdministrateurModel, limit, offset);
    const total = await AdministrateurModel.countAll();
    respondData(res, { data: users, pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const allowedFields = ['nom', 'email', 'password'];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowedFields.includes(k))
    );
    if (Object.keys(data).length === 0) {
      return respondBadRequest(res, 'Aucun champ valide à mettre à jour (nom, email, password)');
    }
    if (data.nom !== undefined && (typeof data.nom !== 'string' || data.nom.length < 1 || data.nom.length > 100)) {
      return respondBadRequest(res, 'Le nom doit contenir entre 1 et 100 caractères');
    }
    if (data.password !== undefined && data.password.length < 8) {
      return respondBadRequest(res, 'Le mot de passe doit contenir au moins 8 caractères');
    }
    await userService.update(AdministrateurModel, req.params.id, data, 'Administrateur');
    respondMessage(res, 'Administrateur mis à jour');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await userService.delete(AdministrateurModel, req.params.id, 'Administrateur');
    respondMessage(res, 'Administrateur supprimé');
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await userService.getById(AdministrateurModel, req.params.id);
    if (!user) return respondNotFound(res, 'Administrateur introuvable');
    respondData(res, user);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return respondBadRequest(res, errors.array());

    const id = await userService.createAdmin(req.body);
    respondMessage(res, 'Administrateur créé avec succès', 201, { adminId: id });
  } catch (error) {
    next(error);
  }
};

exports.listDemandes = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const demandes = await demandeService.list(limit, offset);
    const total = await demandeService.count();
    respondData(res, { demandes, pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

exports.approveDemande = async (req, res, next) => {
  try {
    const adminId = req.user.user_id;
    const body = req.body || {};
    const commentaireAdmin = sanitizePlainText(body.commentaireAdmin || '');
    const result = await demandeService.approve(req.params.id, adminId, commentaireAdmin);

    const demande = await demandeService.findDemande(req.params.id);
    if (!demande) return respondNotFound(res, 'Demande introuvable');

    const setupToken = await PasswordResetModel.create(demande.user_id, 3 * 60 * 60 * 1000);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const setupLink = `${clientUrl}/set-password?token=${setupToken}&email=${encodeURIComponent(demande.email)}`;

    await sendWelcomeWithLink(demande.email, demande.nom, demande.prenom, setupLink)
      .catch(err => console.error('[Email] Erreur envoi bienvenue:', err.message));

    await createNotification(
      demande.user_id,
      'Demande approuvée',
      `Votre demande d'inscription en tant que technicien a été approuvée. ${commentaireAdmin ? 'Commentaire : ' + commentaireAdmin : ''}`,
      'info'
    );

    const msg = 'Demande approuvée. Le compte technicien a été créé. Un email a été envoyé pour configurer le mot de passe.';
    respondData(res, { message: msg });
  } catch (error) {
    next(error);
  }
};

exports.rejectDemande = async (req, res, next) => {
  try {
    const adminId = req.user.user_id;
    const body = req.body || {};
    const commentaireAdmin = sanitizePlainText(body.commentaireAdmin || '');
    await demandeService.reject(req.params.id, adminId, commentaireAdmin);

    const demande = await demandeService.findDemande(req.params.id);
    if (demande) {
      await createNotification(
        demande.user_id,
        'Demande refusée',
        `Votre demande d'inscription en tant que technicien a été refusée. ${commentaireAdmin ? 'Commentaire : ' + commentaireAdmin : ''}`,
        'info'
      );
    }

    respondMessage(res, 'Demande rejetée.');
  } catch (error) {
    next(error);
  }
};
