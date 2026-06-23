const ServiceModel = require('../models/ServiceModel');
const TechnicienModel = require('../models/TechnicienModel');
const { respondData, respondMessage, respondNotFound, respondForbidden } = require('../utils/response');

exports.listPublic = async (req, res, next) => {
  try {
    const services = await ServiceModel.findAllActive();
    respondData(res, services);
  } catch (error) {
    next(error);
  }
};

exports.mine = async (req, res, next) => {
  try {
    const tech = await TechnicienModel.findByUserId(req.user.user_id);
    if (!tech) return respondForbidden(res, 'Profil technicien introuvable');
    const services = await ServiceModel.findByTechnicien(tech.id);
    respondData(res, services);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const tech = await TechnicienModel.findByUserId(req.user.user_id);
    if (!tech) return respondForbidden(res, 'Profil technicien introuvable');
    const { categorie_id, titre, description, prix, duree } = req.body;
    const image = req.file?.filename || null;
    const id = await ServiceModel.create({ technicien_id: tech.id, categorie_id, titre, description, image, prix, duree });
    respondMessage(res, 'Service créé avec succès', 201, { serviceId: id });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) return respondNotFound(res, 'Service introuvable');
    const tech = await TechnicienModel.findByUserId(req.user.user_id);
    if (!tech || service.technicien_id !== tech.id) return respondForbidden(res, 'Action non autorisée');
    const allowed = ['categorie_id', 'titre', 'description', 'prix', 'duree', 'est_actif'];
    const data = Object.fromEntries(allowed.filter(k => k in req.body).map(k => [k, req.body[k]]));
    if (req.file?.filename) data.image = req.file.filename;
    await ServiceModel.update(req.params.id, data);
    respondMessage(res, 'Service mis à jour');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) return respondNotFound(res, 'Service introuvable');
    const tech = await TechnicienModel.findByUserId(req.user.user_id);
    if (!tech || service.technicien_id !== tech.id) return respondForbidden(res, 'Action non autorisée');
    await ServiceModel.delete(req.params.id);
    respondMessage(res, 'Service supprimé');
  } catch (error) {
    next(error);
  }
};
