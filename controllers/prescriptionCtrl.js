const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const prescriptionModel = require('../models/prescriptionModel');

// generate a simple PDF and optionally embed a signature image
const generatePrescription = async (req, res) => {
  try {
    const { doctorId, patientId, prescriptionText, signaturePath } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).send({ message: 'doctorId and patientId required' });
    }

    // prepare output path
    const outDir = path.join(__dirname, '..', 'uploads', 'prescriptions');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const filename = `prescription_${patientId}_${Date.now()}.pdf`;
    const outPath = path.join(outDir, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    doc.fontSize(20).text('Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Doctor ID: ${doctorId}`);
    doc.text(`Patient ID: ${patientId}`);
    doc.moveDown();

    doc.fontSize(12).text('Prescription Details:');
    doc.moveDown(0.5);
    doc.fontSize(11).text(prescriptionText || 'No details provided');

    doc.moveDown(2);
    // add signature image if provided (path should be accessible on server)
    if (signaturePath && fs.existsSync(signaturePath)) {
      try {
        doc.image(signaturePath, { fit: [150, 80], align: 'left' });
        doc.moveDown(1);
        doc.text(`Signed by Doctor: ${doctorId}`);
      } catch (e) {
        console.warn('Could not embed signature image', e);
      }
    }

    doc.end();

    stream.on('finish', async () => {
      const signedAt = new Date();
      const pres = await prescriptionModel.create({
        doctorId,
        patientId,
        prescriptionText,
        pdfPath: outPath,
        signaturePath: signaturePath || null,
        signedAt,
      });
      return res.status(201).send({ message: 'Prescription generated', prescription: pres });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error generating prescription', error: err.message });
  }
};

module.exports = { generatePrescription };
