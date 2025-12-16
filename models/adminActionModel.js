const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  actionType: { type: String, required: true }, // e.g. 'delete-user', 'approve-admin'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetSnapshot: { type: Object }, // store a small snapshot of the target at time of action
  reason: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AdminAction', adminActionSchema);
