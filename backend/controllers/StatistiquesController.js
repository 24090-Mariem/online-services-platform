const db = require('../config/db');
const AvisModel = require('../models/AvisModel');
const { respondData } = require('../utils/response');

exports.homePage = async (req, res, next) => {
  try {
    const [[techCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM techniciens WHERE est_verifie = 1"
    );
    const [[reservationCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM reservations"
    );

    let reviewCount = 0;
    try {
      reviewCount = await AvisModel.countAll();
    } catch {
      reviewCount = 0;
    }

    respondData(res, {
      techniciens: techCount.total,
      reservations: reservationCount.total,
      reviews: reviewCount
    });
  } catch (error) {
    next(error);
  }
};
