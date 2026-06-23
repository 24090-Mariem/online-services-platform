const express = require('express');
const router = express.Router();
const StatistiquesController = require('../controllers/StatistiquesController');

router.get('/overview', StatistiquesController.homePage);

module.exports = router;
