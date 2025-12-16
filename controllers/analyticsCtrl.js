const appointmentModel = require('../models/appointmentModel');
const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');

// appointments per day (last N days)
const appointmentsPerDay = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days + 1);

    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ];

    const rows = await appointmentModel.aggregate(pipeline);
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error computing appointments per day' });
  }
};

// doctor performance summary
const doctorPerformance = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) return res.status(400).send({ message: 'doctorId required' });

    // appointments count
    const total = await appointmentModel.countDocuments({ doctorId });
    const completed = await appointmentModel.countDocuments({ doctorId, status: 'approved' });

    // revenue: sum doctor fee * count of completed appointments
    const doctor = await doctorModel.findOne({ userId: doctorId });
    const fee = doctor && doctor.feesPerCunsaltation ? doctor.feesPerCunsaltation : 0;
    const revenue = fee * completed;

    res.send({ doctorId, totalAppointments: total, completedAppointments: completed, revenue });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error computing doctor performance' });
  }
};

// admin summary
const adminSummary = async (req, res) => {
  try {
    const usersCount = await userModel.countDocuments();
    const doctorsCount = await doctorModel.countDocuments();
    const appointmentsCount = await appointmentModel.countDocuments();
    const cancelled = await appointmentModel.countDocuments({ status: 'cancelled' });

    // revenue: join appointments with doctor fees
    const pipeline = [
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: 'userId', as: 'doctor' } },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, totalRevenue: { $sum: { $ifNull: ['$doctor.feesPerCunsaltation', 0] } }, count: { $sum: 1 } } },
    ];
    const rev = await appointmentModel.aggregate(pipeline);
    const revenue = rev && rev[0] ? rev[0].totalRevenue : 0;

    res.send({ usersCount, doctorsCount, appointmentsCount, cancelled, revenue, cancellationRate: appointmentsCount ? (cancelled / appointmentsCount) : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error computing admin summary' });
  }
};

module.exports = { appointmentsPerDay, doctorPerformance, adminSummary };
