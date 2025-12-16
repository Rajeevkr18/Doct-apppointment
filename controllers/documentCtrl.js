const path = require('path');
const fs = require('fs');
const documentModel = require('../models/documentModel');

// upload handled by multer in routes; req.file contains info
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: 'No file uploaded' });
    const { patientId, uploaderId } = req.body;
    if (!patientId || !uploaderId) return res.status(400).send({ message: 'patientId and uploaderId required' });

    const doc = await documentModel.create({
      uploaderId,
      patientId,
      filename: req.file.originalname,
      filePath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).send({ message: 'Uploaded', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Upload failed' });
  }
};

const listDocumentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const docs = await documentModel.find({ patientId }).sort({ createdAt: -1 });
    res.send(docs);
  } catch (err) {
    res.status(500).send({ message: 'Error listing documents' });
  }
};

const annotateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, text, page, coords } = req.body;
    const doc = await documentModel.findById(id);
    if (!doc) return res.status(404).send({ message: 'Document not found' });
    const note = { authorId, text, page: page || 1, coords: coords || {} };
    doc.annotations.push(note);
    await doc.save();
    res.send({ message: 'Annotation added', annotation: note });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error annotating' });
  }
};

module.exports = { uploadDocument, listDocumentsForPatient, annotateDocument };
