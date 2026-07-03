const { validationResult } = require('express-validator');
const AvisModel = require('../models/AvisModel');
const ClientModel = require('../models/ClientModel');
const reviewService = require('../services/reviewService');
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
    const avis = await reviewService.assertReviewAccess(req.user, req.params.id);
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

exports.findMyReviews = async (req, res, next) => {
  try {
    const client = await ClientModel.findByUserId(req.user.user_id);
    if (!client) return respondForbidden(res, 'Profil client introuvable');
    const avis = await AvisModel.findByClient(client.id);
    respondData(res, avis);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return respondBadRequest(res, errors.array());

    const { reservation_id, technicien_id, note, commentaire } = req.body;
    const id = await reviewService.createReview(req.user.id, {
      reservation_id, technicien_id, note, commentaire,
    });
    respondMessage(res, 'Avis créé avec succès', 201, { id });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return respondBadRequest(res, errors.array());

    const avis = await reviewService.updateReview(req.user, req.params.id, req.body);
    respondData(res, avis, 'Avis mis à jour');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.user, req.params.id);
    respondMessage(res, 'Avis supprimé');
  } catch (error) {
    next(error);
  }
};
