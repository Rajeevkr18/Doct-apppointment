const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const appointmentModel = require("../models/appointmentModel");
const AdminAction = require("../models/adminActionModel");

// Simple audit logger helper
const logAdminAction = async ({ actionType, performedBy, targetUserId = null, targetSnapshot = null, reason = null, meta = null }) => {
  try {
    const doc = new AdminAction({ actionType, performedBy, targetUserId, targetSnapshot, reason, meta });
    await doc.save();
  } catch (err) {
    console.warn('Failed to write admin action log', err);
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "erorr while fetching users",
      error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting doctors data",
      error,
    });
  }
};

// doctor account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    // update doctor and return the new doc
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status }, { new: true });
    if (!doctor) {
      return res.status(404).send({ success: false, message: 'Doctor not found' });
    }

    // try to notify related user
    if (doctor.userId) {
      const user = await userModel.findById(doctor.userId);
      if (user) {
        user.notifcation = user.notifcation || [];
        user.notifcation.push({
          type: "doctor-account-request-updated",
          message: `Your Doctor Account Request Has been ${status}`,
          onClickPath: "/notification",
        });
        user.isDoctor = status === "approved";
        await user.save();
      } else {
        console.warn(`User not found for doctor ${doctorId} when changing account status.`);
      }
    }

    res.status(200).send({
      success: true,
      message: `Account Status Updated to ${status}`,
      data: doctor,
    });
    // audit log
    try {
      await logAdminAction({ actionType: `doctor-status-${status}`, performedBy: req.body.userId, targetUserId: doctor.userId, targetSnapshot: doctor.toObject(), meta: { doctorId: doctor._id } });
    } catch (e) {
      console.warn('audit log failed for changeAccountStatus', e);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror in Account Status",
      error,
    });
  }
};

// DELETE user (admin) - remove user and related doctor & appointments
const deleteUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).send({ success: false, message: "userId is required" });
    }

    // remove appointments for the user
    await appointmentModel.deleteMany({ $or: [{ userId }, { 'doctorInfo._id': userId }] }).catch((e) => console.warn(e));

    // remove doctor profile if exists
    await doctorModel.deleteMany({ userId }).catch((e) => console.warn(e));

    // fetch snapshot for audit
    const targetSnapshot = await userModel.findById(userId).lean().catch(() => null);

    // finally remove user
    await userModel.findByIdAndDelete(userId);

    // log admin action
    try {
      await logAdminAction({ actionType: 'delete-user', performedBy: req.body.userId, targetUserId: userId, targetSnapshot });
    } catch (e) {
      console.warn('audit log failed for delete-user', e);
    }

    res.status(200).send({ success: true, message: "User and related data deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error deleting user", error });
  }
};

// Approve or revoke admin status for a user
const approveAdminController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approve } = req.body; // boolean
    if (typeof approve !== 'boolean') {
      return res.status(400).send({ success: false, message: 'approve (boolean) is required in body' });
    }

    // requester id (set by authMiddleware)
    const requesterId = req.body.userId;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).send({ success: false, message: 'User not found' });

    // Prevent an admin from revoking their own admin status
    if (requesterId && requesterId.toString() === userId.toString() && approve === false) {
      return res.status(403).send({ success: false, message: 'You cannot revoke your own admin privileges.' });
    }

    // If revoking admin, ensure we are not removing the last remaining admin
    if (approve === false && user.isAdmin) {
      const adminCount = await userModel.countDocuments({ isAdmin: true });
      // if there is only one admin (this user), disallow revoke
      if (adminCount <= 1) {
        return res.status(400).send({ success: false, message: 'Cannot revoke admin: this is the last admin account.' });
      }
    }

    user.isAdmin = approve;
    await user.save();
    // audit
    try {
      await logAdminAction({ actionType: approve ? 'approve-admin' : 'revoke-admin', performedBy: requesterId, targetUserId: userId, targetSnapshot: user.toObject() });
    } catch (e) {
      console.warn('audit log failed for approve-admin', e);
    }
    res.status(200).send({ success: true, message: `User admin status set to ${approve}`, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error updating admin status', error });
  }
};

// Bulk user actions: delete | approveAdmin | revokeAdmin
const bulkUserAction = async (req, res) => {
  try {
    const { action, userIds } = req.body;
    const requesterId = req.body.userId;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).send({ success: false, message: 'userIds (array) is required' });
    }

    const results = [];

    // For revoke flows, count admins once
    let adminCount = await userModel.countDocuments({ isAdmin: true });

    for (const id of userIds) {
      try {
        if (action === 'delete') {
          if (id.toString() === requesterId?.toString()) {
            results.push({ id, success: false, message: 'Cannot delete yourself' });
            continue;
          }
          // snapshot
          const snapshot = await userModel.findById(id).lean().catch(() => null);
          await appointmentModel.deleteMany({ $or: [{ userId: id }, { 'doctorInfo._id': id }] }).catch(() => null);
          await doctorModel.deleteMany({ userId: id }).catch(() => null);
          await userModel.findByIdAndDelete(id).catch(() => null);
          await logAdminAction({ actionType: 'delete-user', performedBy: requesterId, targetUserId: id, targetSnapshot: snapshot });
          results.push({ id, success: true, message: 'Deleted' });
        } else if (action === 'approveAdmin' || action === 'revokeAdmin') {
          const approve = action === 'approveAdmin';
          const target = await userModel.findById(id);
          if (!target) {
            results.push({ id, success: false, message: 'User not found' });
            continue;
          }
          if (approve === false && id.toString() === requesterId?.toString()) {
            results.push({ id, success: false, message: 'Cannot revoke your own admin privileges' });
            continue;
          }
          if (approve === false && target.isAdmin) {
            if (adminCount <= 1) {
              results.push({ id, success: false, message: 'Cannot revoke admin: last admin' });
              continue;
            }
            // revoke
            target.isAdmin = false;
            await target.save();
            adminCount -= 1;
            await logAdminAction({ actionType: 'revoke-admin', performedBy: requesterId, targetUserId: id, targetSnapshot: target.toObject() });
            results.push({ id, success: true, message: 'Revoked' });
          } else if (approve === true) {
            if (target.isAdmin) {
              results.push({ id, success: false, message: 'Already admin' });
              continue;
            }
            target.isAdmin = true;
            await target.save();
            adminCount += 1;
            await logAdminAction({ actionType: 'approve-admin', performedBy: requesterId, targetUserId: id, targetSnapshot: target.toObject() });
            results.push({ id, success: true, message: 'Approved' });
          } else {
            results.push({ id, success: false, message: 'No-op' });
          }
        } else {
          results.push({ id, success: false, message: 'Unknown action' });
        }
      } catch (err) {
        console.error('bulk action error for', id, err);
        results.push({ id, success: false, message: 'Server error' });
      }
    }

    return res.status(200).send({ success: true, message: 'Bulk action completed', results });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: 'Bulk action failed', error });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  deleteUserController,
  approveAdminController,
  bulkUserAction,
};


