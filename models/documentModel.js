const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  authorId: String,
  text: String,
  page: Number,
  coords: Object,
  createdAt: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  uploaderId: { type: String, required: true },
  patientId: { type: String, required: true },
  filename: String,
  filePath: String,
  mimetype: String,
  size: Number,
  annotations: [annotationSchema],
}, { timestamps: true });

const documentModel = mongoose.model('documents', documentSchema);
module.exports = documentModel;
