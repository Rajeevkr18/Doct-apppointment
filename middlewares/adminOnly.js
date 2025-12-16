const userModel = require('../models/userModels');

module.exports = async (req, res, next) => {
  try {
    const requesterId = req.body.userId;
    if (!requesterId) return res.status(401).send({ success: false, message: 'Unauthorized' });
    const user = await userModel.findById(requesterId);
    if (!user || !user.isAdmin) {
      return res.status(403).send({ success: false, message: 'Admin privileges required' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};
