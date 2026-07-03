const ServiceModel = require('../models/ServiceModel');
const TechnicienModel = require('../models/TechnicienModel');
const ClientModel = require('../models/ClientModel');
const ReservationModel = require('../models/ReservationModel');
const { createNotification } = require('./notificationService');
const AppError = require('../utils/AppError');

const transitions = {
  accept: {
    from: 'EN_ATTENTE',
    to: 'CONFIRMEE',
    notifTitle: 'Réservation acceptée',
    notifBody: (service, tech) =>
      `Votre réservation pour "${service.titre}" a été acceptée par ${tech.prenom} ${tech.nom}`,
  },
  reject: {
    from: 'EN_ATTENTE',
    to: 'REJETEE',
    notifTitle: 'Réservation refusée',
    notifBody: (service, tech) =>
      `Votre réservation pour "${service.titre}" a été refusée par ${tech.prenom} ${tech.nom}`,
  },
  complete: {
    from: 'CONFIRMEE',
    to: 'TERMINEE',
    notifTitle: 'Service terminé',
    notifBody: (service, tech) =>
      `Le service "${service.titre}" a été marqué comme terminé par ${tech.prenom} ${tech.nom}. N'oubliez pas de laisser un avis !`,
  },
};

async function transitionStatus(technicienUserId, reservationId, action) {
  const transition = transitions[action];
  if (!transition) throw new AppError('Action invalide', 400);

  const tech = await TechnicienModel.findByUserId(technicienUserId);
  if (!tech) throw new AppError('Action non autorisée', 403);

  const reservation = await ReservationModel.findById(reservationId);
  if (!reservation) throw new AppError('Réservation introuvable', 404);

  const service = await ServiceModel.findById(reservation.service_id);
  if (!service || service.technicien_id !== tech.id) {
    throw new AppError('Action non autorisée', 403);
  }

  if (reservation.statut !== transition.from) {
    throw new AppError(
      action === 'complete'
        ? 'Seules les réservations confirmées peuvent être terminées'
        : 'Cette réservation a déjà été traitée',
      400
    );
  }

  await ReservationModel.updateStatus(reservationId, transition.to);

  const client = await ClientModel.findById(reservation.client_id);
  if (client) {
    await createNotification(
      client.user_id,
      transition.notifTitle,
      transition.notifBody(service, tech),
      'reservation'
    );
  }

  return true;
}

module.exports = { transitionStatus };
