const { validationResult } = require('express-validator');
const AvisModel = require('../models/AvisModel');
const ClientModel = require('../models/ClientModel');
const TechnicienModel = require('../models/TechnicienModel');
const { createNotification } = require('../services/notificationService');
const { respondData, respondMessage, respondNotFound, respondBadRequest, respondForbidden } = require('../utils/response');

exports.findAll = async (req, res, next) => {
  try {
    const avis = await AvisModel.findAll();
    respondData(res, avis);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const avis = await AvisModel.findById(req.params.id);
    if (!avis) return respondNotFound(res, 'Avis introuvable');
    respondData(res, avis);
  } catch (error) {
    next(error);
  }
};

exports.findByTechnicien = async (req, res, next) => {
  try {
    const avis = await AvisModel.findByTechnicien(req.params.id);
    respondData(res, avis);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return respondBadRequest(res, errors.array());

    const client = await ClientModel.findByUserId(req.user.user_id);
    if (!client) return respondForbidden(res, 'Profil client introuvable');

    const { reservation_id, technicien_id, note, commentaire } = req.body;
    const client_id = client.id;
    const id = await AvisModel.create({ reservation_id, client_id, technicien_id, note, commentaire });
    await TechnicienModel.updateScore(technicien_id);

    const tech = await TechnicienModel.findById(technicien_id);
    if (tech) {
      await createNotification(
        tech.user_id,
        'Nouvel avis',
        `Vous avez reçu un avis de ${note}/10${commentaire ? ` : "${commentaire}"` : ''}`,
        'review'
      );
    }

    respondMessage(res, 'Avis créé avec succès', 201, { id });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const ok = await AvisModel.update(req.params.id, req.body);
    if (!ok) return respondNotFound(res, 'Avis introuvable');
    respondMessage(res, 'Avis mis à jour');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const ok = await AvisModel.delete(req.params.id);
    if (!ok) return respondNotFound(res, 'Avis introuvable');
    respondMessage(res, 'Avis supprimé');
  } catch (error) {
    next(error);
  }
};
