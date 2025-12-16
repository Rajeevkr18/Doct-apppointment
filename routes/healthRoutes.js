const express = require('express');
const router = express.Router();
const { addMetric, getMetricsForPatient } = require('../controllers/healthCtrl');

// POST /api/v1/health
router.post('/', addMetric);

// GET /api/v1/health/patient/:patientId
router.get('/patient/:patientId', getMetricsForPatient);

module.exports = router;
