const express = require('express');
const router = express.Router();
const { appointmentsPerDay, doctorPerformance, adminSummary } = require('../controllers/analyticsCtrl');

// GET /api/v1/analytics/appointments-per-day?days=30
router.get('/appointments-per-day', appointmentsPerDay);

// GET /api/v1/analytics/doctor/:doctorId
router.get('/doctor/:doctorId', doctorPerformance);

// GET /api/v1/analytics/admin/summary
router.get('/admin/summary', adminSummary);

module.exports = router;
