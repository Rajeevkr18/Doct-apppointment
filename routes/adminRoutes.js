const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const adminOnly = require("../middlewares/adminOnly");

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//POST ACCOUNT STATUS
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);

// DELETE user and related data
router.delete("/delete-user/:userId", authMiddleware, async (req, res, next) => {
  // forward to controller
  try {
    const { deleteUserController } = require("../controllers/adminCtrl");
    return deleteUserController(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Approve or revoke admin privileges for a user
router.post('/approve-admin/:userId', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { approve } = req.body;
    const { approveAdminController } = require('../controllers/adminCtrl');
    req.body.approve = approve; // pass through
    return approveAdminController(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Bulk actions for users (delete, approveAdmin, revokeAdmin)
router.post('/bulk-user-action', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { action, userIds } = req.body; // action: 'delete' | 'approveAdmin' | 'revokeAdmin'
    const { bulkUserAction } = require('../controllers/adminCtrl');
    req.body.action = action;
    req.body.userIds = userIds;
    return bulkUserAction(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
