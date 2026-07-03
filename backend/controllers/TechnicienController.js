const { validationResult } = require('express-validator');
const TechnicienModel = require('../models/TechnicienModel');
const userService = require('../services/userService');
const demandeService = require('../services/demandeService');
const upload = require('../config/upload');
const { respondData, respondMessage, respondNotFound, respondBadRequest, respondForbidden, getPagination, getPaginationMeta } = require('../utils/response');
const { sanitizeObject } = require('../validations/sanitize');

const mapPrivateFile = (file) => {
  if (!file?.filename) return null;
  return upload.toPrivatePath(file.filename);
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const users = await userService.list(TechnicienModel, limit, offset);
    const total = await TechnicienModel.countAll();
    respondData(res, { data: users, pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const safeBody = sanitizeObject(req.body, ['nom', 'prenom', 'telephone', 'adresse', 'specialite']);
    const data = {
      ...safeBody,
      piece_identite: mapPrivateFile(req.files?.piece_identite?.[0]) || req.body.piece_identite || null,
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
    const allowedFields = ['nom', 'prenom', 'email', 'password', 'telephone', 'adresse', 'specialite', 'est_verifie'];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowedFields.includes(k))
    );
    if (Object.keys(data).length === 0) {
      return respondBadRequest(res, 'Aucun champ valide à mettre à jour');
    }
    if (data.nom !== undefined && (typeof data.nom !== 'string' || data.nom.length < 1 || data.nom.length > 100)) {
      return respondBadRequest(res, 'Le nom doit contenir entre 1 et 100 caractères');
    }
    if (data.prenom !== undefined && (typeof data.prenom !== 'string' || data.prenom.length < 1 || data.prenom.length > 100)) {
      return respondBadRequest(res, 'Le prénom doit contenir entre 1 et 100 caractères');
    }
    if (data.password !== undefined && data.password.length < 8) {
      return respondBadRequest(res, 'Le mot de passe doit contenir au moins 8 caractères');
    }
    if (data.telephone !== undefined && !/^[+\d][\d\s\-().]{6,20}$/.test(data.telephone)) {
      return respondBadRequest(res, 'Format de téléphone invalide');
    }
    await userService.update(TechnicienModel, req.params.id, data, 'Technicien');
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
    const { page, limit, offset } = getPagination(req);
    const all = await TechnicienModel.findAll(limit, offset);
    const verified = all.filter(t => t.est_verifie);
    const total = await TechnicienModel.countAll();
    respondData(res, { data: verified, pagination: getPaginationMeta(page, limit, total) });
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

    const safeBody = sanitizeObject(req.body, ['nom', 'prenom', 'telephone', 'specialite']);
    const data = {
      nom: safeBody.nom,
      prenom: safeBody.prenom,
      email: req.body.email,
      telephone: safeBody.telephone,
      specialite: safeBody.specialite,
      piece_identite: mapPrivateFile(req.files?.piece_identite?.[0]),
      diplome: mapPrivateFile(req.files?.diplome?.[0]),
      photo_profil: req.files?.photo_profil?.[0]?.filename || null,
    };

    const result = await demandeService.submit(data);
    respondMessage(res, 'Votre demande d\'inscription a été soumise. Elle sera traitée par un administrateur.', 201, { demandeId: result.demandeId });
  } catch (error) {
    next(error);
  }
};
