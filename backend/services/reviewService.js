const AvisModel = require('../models/AvisModel');
const ClientModel = require('../models/ClientModel');
const ReservationModel = require('../models/ReservationModel');
const ServiceModel = require('../models/ServiceModel');
const TechnicienModel = require('../models/TechnicienModel');
const { createNotification } = require('./notificationService');
const AppError = require('../utils/AppError');

async function createReview(userId, { reservation_id, technicien_id, note, commentaire }) {
  const client = await ClientModel.findByUserId(userId);
  if (!client) throw new AppError('Profil client introuvable', 403);

  const reservation = await ReservationModel.findById(reservation_id);
  if (!reservation) throw new AppError('Réservation introuvable', 404);
  if (reservation.client_id !== client.id) {
    throw new AppError('Cette réservation ne vous appartient pas', 403);
  }
  if (reservation.statut !== 'TERMINEE') {
    throw new AppError('Vous ne pouvez noter que les réservations terminées', 400);
  }

  const service = await ServiceModel.findById(reservation.service_id);
  if (!service || service.technicien_id !== Number(technicien_id)) {
    throw new AppError('Technicien invalide pour cette réservation', 400);
  }

  const existing = await AvisModel.findByReservationId(reservation_id);
  if (existing) throw new AppError('Un avis existe déjà pour cette réservation', 409);

  const id = await AvisModel.create({
    reservation_id,
    client_id: client.id,
    technicien_id,
    note,
    commentaire,
  });

  await TechnicienModel.addScore(technicien_id, note);

  const tech = await TechnicienModel.findById(technicien_id);
  if (tech) {
    await createNotification(
      tech.user_id,
      'Nouvel avis',
      `Vous avez reçu un avis de ${note}/10${commentaire ? ` : "${commentaire}"` : ''}`,
      'review'
    );
  }

  return id;
}

async function assertReviewAccess(user, avisId) {
  const avis = await AvisModel.findById(avisId);
  if (!avis) throw new AppError('Avis introuvable', 404);

  if (user.role === 'admin') return avis;

  const client = await ClientModel.findByUserId(user.id);
  if (client && avis.client_id === client.id) return avis;

  throw new AppError('Action non autorisée', 403);
}

async function updateReview(user, avisId, data) {
  await assertReviewAccess(user, avisId);
  const ok = await AvisModel.update(avisId, data);
  if (!ok) throw new AppError('Avis introuvable', 404);

  const avis = await AvisModel.findById(avisId);
  if (avis) await TechnicienModel.recalculateScore(avis.technicien_id);
  return avis;
}

async function deleteReview(user, avisId) {
  const avis = await assertReviewAccess(user, avisId);
  const ok = await AvisModel.delete(avisId);
  if (!ok) throw new AppError('Avis introuvable', 404);
  await TechnicienModel.recalculateScore(avis.technicien_id);
  return avis;
}

module.exports = {
  createReview,
  assertReviewAccess,
  updateReview,
  deleteReview,
};
