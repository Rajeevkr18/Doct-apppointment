const express = require('express');
const router = express.Router();
const { generatePrescription } = require('../controllers/prescriptionCtrl');

// POST /api/v1/prescription/generate
router.post('/generate', generatePrescription);

module.exports = router;
