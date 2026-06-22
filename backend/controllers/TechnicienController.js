const { validationResult } = require('express-validator');
const TechnicienModel = require('../models/TechnicienModel');
const userService = require('../services/userService');
const demandeService = require('../services/demandeService');
const { respondData, respondMessage, respondNotFound, respondBadRequest, respondForbidden } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const users = await userService.list(TechnicienModel);
    respondData(res, users);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      piece_identite: req.files?.piece_identite?.[0]?.filename || req.body.piece_identite || null,
      photo_profil: req.files?.photo_profil?.[0]?.filename || req.body.photo_profil || null,
    };
    const id = await userService.createTechnicien(data);
    respondMessage(res, 'Technicien créé avec succès', 201, { technicienId: id });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await userService.update(TechnicienModel, req.params.id, req.body, 'Technicien');
    respondMessage(res, 'Technicien mis à jour');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await userService.delete(TechnicienModel, req.params.id, 'Technicien');
    respondMessage(res, 'Technicien supprimé');
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await userService.getById(TechnicienModel, req.params.id);
    if (!user) return respondNotFound(res, 'Technicien introuvable');
    respondData(res, user);
  } catch (error) {
    next(error);
  }
};

exports.listPublic = async (req, res, next) => {
  try {
    const techniciens = await TechnicienModel.findAll();
    const verified = techniciens.filter(t => t.est_verifie);
    respondData(res, verified);
  } catch (error) {
    next(error);
  }
};

exports.getPublicProfile = async (req, res, next) => {
  try {
    const technicien = await TechnicienModel.findById(req.params.id);
    if (!technicien || !technicien.est_verifie) return respondNotFound(res, 'Technicien introuvable');
    respondData(res, technicien);
  } catch (error) {
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    const rows = await TechnicienModel.search(req.query);
    respondData(res, rows);
  } catch (error) {
    next(error);
  }
};

exports.submitDemande = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return respondBadRequest(res, errors.array());

    const data = {
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      telephone: req.body.telephone,
      specialite: req.body.specialite,
      piece_identite: req.files?.piece_identite?.[0]?.filename || null,
      diplome: req.files?.diplome?.[0]?.filename || null,
      photo_profil: req.files?.photo_profil?.[0]?.filename || null,
    };

    const id = await demandeService.submit(data);
    respondMessage(res, 'Votre demande d\'inscription a été soumise. Elle sera traitée par un administrateur.', 201, { demandeId: id });
  } catch (error) {
    next(error);
  }
};
