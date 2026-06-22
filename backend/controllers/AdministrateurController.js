const { validationResult } = require('express-validator');
const AdministrateurModel = require('../models/AdministrateurModel');
const userService = require('../services/userService');
const demandeService = require('../services/demandeService');
const { respondData, respondMessage, respondNotFound, respondBadRequest } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const users = await userService.list(AdministrateurModel);
    respondData(res, users);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await userService.update(AdministrateurModel, req.params.id, req.body, 'Administrateur');
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
    const demandes = await demandeService.list();
    respondData(res, { demandes });
  } catch (error) {
    next(error);
  }
};

exports.approveDemande = async (req, res, next) => {
  try {
    const adminId = req.user.user_id;
    const commentaireAdmin = req.body.commentaireAdmin || '';
    const result = await demandeService.approve(req.params.id, adminId, commentaireAdmin);

    const msg = result.isExistingClient
      ? 'Demande approuvée. Le technicien a été créé. Le compte client existant a été conservé.'
      : 'Demande approuvée. Le compte technicien a été créé.';
    respondData(res, { isExistingClient: result.isExistingClient, message: msg });
  } catch (error) {
    next(error);
  }
};

exports.rejectDemande = async (req, res, next) => {
  try {
    const adminId = req.user.user_id;
    const commentaireAdmin = req.body.commentaireAdmin || '';
    await demandeService.reject(req.params.id, adminId, commentaireAdmin);
    respondMessage(res, 'Demande rejetée.');
  } catch (error) {
    next(error);
  }
};
