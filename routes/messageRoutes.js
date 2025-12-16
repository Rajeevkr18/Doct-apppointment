const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  sendMessageController,
  getConversationController,
  listConversationsController,
  markReadController,
} = require('../controllers/messageCtrl');

router.post('/send', authMiddleware, sendMessageController);
router.get('/conversation/:peerId', authMiddleware, getConversationController);
router.get('/conversations', authMiddleware, listConversationsController);
router.post('/mark-read/:messageId', authMiddleware, markReadController);

module.exports = router;
