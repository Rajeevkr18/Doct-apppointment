const Message = require('../models/messageModel');
const userModel = require('../models/userModels');

// send a message (either user -> doctor or doctor -> user)
const sendMessageController = async (req, res) => {
  try {
    const from = req.body.userId; // set by authMiddleware
    const { to, doctorId, text } = req.body;
    if (!to || !text) return res.status(400).send({ success: false, message: 'to and text are required' });

    const msg = new Message({ from, to, doctorId, text });
    await msg.save();

    // push notification to recipient
    try {
      const recipient = await userModel.findById(to);
      if (recipient) {
        recipient.notifcation = recipient.notifcation || [];
        recipient.notifcation.push({ type: 'message', message: 'You have a new message', onClickPath: '/notification' });
        await recipient.save();
      }
    } catch (e) {
      console.warn('failed to push message notification', e);
    }

    res.status(201).send({ success: true, message: 'Message sent', data: msg });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error sending message', error });
  }
};

// get conversation between current user and a peer (doctor user id)
const getConversationController = async (req, res) => {
  try {
    const me = req.body.userId;
    const peer = req.params.peerId; // other user's id
    if (!peer) return res.status(400).send({ success: false, message: 'peerId required' });

    const messages = await Message.find({
      $or: [
        { from: me, to: peer },
        { from: peer, to: me }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).send({ success: true, data: messages });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error fetching conversation', error });
  }
};

// list conversations (latest message per peer) for current user
const listConversationsController = async (req, res) => {
  try {
    const me = req.body.userId;
    const msgs = await Message.find({ $or: [{ from: me }, { to: me }] }).sort({ createdAt: -1 }).lean();
    const map = new Map();
    for (const m of msgs) {
      const peer = m.from.toString() === me.toString() ? m.to.toString() : m.from.toString();
      if (!map.has(peer)) {
        map.set(peer, m);
      }
    }
    const results = [];
    for (const [peerId, lastMsg] of map.entries()) {
      // fetch peer info
      const peerUser = await userModel.findById(peerId).select('-password').lean().catch(() => null);
      results.push({ peer: peerUser, lastMessage: lastMsg });
    }
    res.status(200).send({ success: true, data: results });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error listing conversations', error });
  }
};

// mark a message as read
const markReadController = async (req, res) => {
  try {
    const me = req.body.userId;
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).send({ success: false, message: 'Message not found' });
    if (msg.to.toString() !== me.toString()) return res.status(403).send({ success: false, message: 'Not authorized' });
    msg.read = true;
    await msg.save();
    res.status(200).send({ success: true, message: 'Message marked read' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error marking read', error });
  }
};

module.exports = {
  sendMessageController,
  getConversationController,
  listConversationsController,
  markReadController,
};
