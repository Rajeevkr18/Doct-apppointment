const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadDocument, listDocumentsForPatient, annotateDocument } = require('../controllers/documentCtrl');

// configure multer storage to server/uploads/documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', 'uploads', 'documents');
    // ensure dir exists
    const fs = require('fs');
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}_${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// POST /api/v1/documents/upload
router.post('/upload', upload.single('file'), uploadDocument);

// GET /api/v1/documents/patient/:patientId
router.get('/patient/:patientId', listDocumentsForPatient);

// POST /api/v1/documents/:id/annotate
router.post('/:id/annotate', annotateDocument);

module.exports = router;
