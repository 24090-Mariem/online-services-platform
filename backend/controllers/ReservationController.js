const ReservationModel = require('../models/ReservationModel');
const ServiceModel = require('../models/ServiceModel');
const ClientModel = require('../models/ClientModel');
const TechnicienModel = require('../models/TechnicienModel');
const { createNotification } = require('../services/notificationService');
const reservationService = require('../services/reservationService');
const { respondData, respondMessage, respondNotFound, respondBadRequest, respondForbidden } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
    const client = await ClientModel.findByUserId(req.user.user_id);
    if (!client) return respondForbidden(res, 'Profil client introuvable');
    const { service_id, date_service, notes } = req.body;
    const service = await ServiceModel.findById(service_id);
    if (!service) return respondNotFound(res, 'Service introuvable');
    if (!service.est_actif) return respondBadRequest(res, 'Ce service n\'est plus disponible');
    const id = await ReservationModel.create({ client_id: client.id, service_id, date_service, notes, montant: service.prix });

    const tech = await TechnicienModel.findById(service.technicien_id);
    if (tech) {
      await createNotification(
        tech.user_id,
        'Nouvelle réservation',
        `${client.prenom} ${client.nom} a réservé votre service "${service.titre}"`,
        'reservation'
      );
    }

    respondMessage(res, 'Réservation effectuée avec succès', 201, { reservationId: id });
  } catch (error) {
    next(error);
  }
};

exports.mine = async (req, res, next) => {
  try {
    const client = await ClientModel.findByUserId(req.user.user_id);
    if (!client) return respondForbidden(res, 'Profil client introuvable');
    const reservations = await ReservationModel.findByClient(client.id);
    respondData(res, reservations);
  } catch (error) {
    next(error);
  }
};

exports.technicienReservations = async (req, res, next) => {
  try {
    const tech = await TechnicienModel.findByUserId(req.user.user_id);
    if (!tech) return respondForbidden(res, 'Profil technicien introuvable');
    const reservations = await ReservationModel.findByTechnicien(tech.id);
    respondData(res, reservations);
  } catch (error) {
    next(error);
  }
};

exports.accept = async (req, res, next) => {
  try {
    await reservationService.transitionStatus(req.user.user_id, req.params.id, 'accept');
    respondMessage(res, 'Réservation acceptée');
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    await reservationService.transitionStatus(req.user.user_id, req.params.id, 'reject');
    respondMessage(res, 'Réservation refusée');
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

exports.findByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rows = await ReservationModel.findByUserId(userId);
    respondData(res, rows);
  } catch (error) {
    next(error);
  }
};

exports.complete = async (req, res, next) => {
  try {
    await reservationService.transitionStatus(req.user.user_id, req.params.id, 'complete');
    respondMessage(res, 'Réservation marquée comme terminée');
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
