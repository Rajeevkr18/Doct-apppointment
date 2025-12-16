const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientId: { type: String, required: true },
  prescriptionText: { type: String },
  pdfPath: { type: String },
  signaturePath: { type: String }, // optional image path used to sign
  signedAt: { type: Date },
}, { timestamps: true });

const prescriptionModel = mongoose.model('prescriptions', prescriptionSchema);
module.exports = prescriptionModel;
