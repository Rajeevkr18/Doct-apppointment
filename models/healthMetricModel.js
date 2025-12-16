const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  metricType: { type: String, required: true }, // e.g. BMI, blood_pressure, glucose
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const healthMetricModel = mongoose.model('healthmetrics', healthMetricSchema);
module.exports = healthMetricModel;
