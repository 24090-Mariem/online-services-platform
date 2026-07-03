const CategorieModel = require('../models/CategorieModel');
const { respondData, respondMessage, respondNotFound, respondBadRequest } = require('../utils/response');

exports.findAll = async (req, res, next) => {
  try {
    const categories = await CategorieModel.findAll();
    respondData(res, categories);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const categorie = await CategorieModel.findById(req.params.id);
    if (!categorie) return respondNotFound(res, 'Catégorie introuvable');
    respondData(res, categorie);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nom, description, icone } = req.body;
    if (!nom) return respondBadRequest(res, 'Le nom est requis');
    const id = await CategorieModel.create({ nom, description, icone });
    respondMessage(res, 'Catégorie créée avec succès', 201, { id });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { nom, description, icone } = req.body;
    if (!nom && !description && !icone) {
      return respondBadRequest(res, 'Au moins un champ (nom, description, icone) est requis');
    }
    if (nom && typeof nom === 'string') {
      if (nom.length < 1 || nom.length > 100) return respondBadRequest(res, 'Le nom doit contenir entre 1 et 100 caractères');
    }
    const ok = await CategorieModel.update(req.params.id, { nom, description, icone });
    if (!ok) return respondNotFound(res, 'Catégorie introuvable');
    respondMessage(res, 'Catégorie mise à jour');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const ok = await CategorieModel.delete(req.params.id);
    if (!ok) return respondNotFound(res, 'Catégorie introuvable');
    respondMessage(res, 'Catégorie supprimée');
  } catch (error) {
    next(error);
  }
};
