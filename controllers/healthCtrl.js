const healthMetricModel = require('../models/healthMetricModel');

const addMetric = async (req, res) => {
  try {
    const { patientId, metricType, value, unit, recordedAt } = req.body;
    if (!patientId || !metricType || typeof value === 'undefined') {
      return res.status(400).send({ message: 'patientId, metricType and value are required' });
    }
    const metric = await healthMetricModel.create({ patientId, metricType, value, unit, recordedAt });
    res.status(201).send({ message: 'Metric recorded', metric });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error recording metric' });
  }
};

const getMetricsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { metricType } = req.query;
    const filter = { patientId };
    if (metricType) filter.metricType = metricType;
    const metrics = await healthMetricModel.find(filter).sort({ recordedAt: 1 });
    res.send(metrics);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching metrics' });
  }
};

module.exports = { addMetric, getMetricsForPatient };
