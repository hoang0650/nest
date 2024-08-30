const { Message } = require('../models/message');

async function sendMessage(req, res) {
    const { chatType, id } = req.params;

    let messages;
    if (chatType === 'private') {
        messages = await Message.find({ receiver: id }).populate('senderId');
    } else if (chatType === 'group') {
        messages = await Message.find({ groupId: id }).populate('senderId');
    }

    res.json(messages);
};


async function getMessages(req, res) {
    const { receiverId, chatType, groupId } = req.body;
    const newMessage = new Message({
        sender: req.body.sender,
        text: req.body.text,
        imageUrl: req.body.imageUrl || null,
        receiver: chatType === 'private' ? receiverId : null,
        groupId: chatType === 'group' ? groupId : null,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
};

async function getGroupMessages (req, res) {
    const { groupId } = req.params;
    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    res.json(messages);
  }

module.exports = {
    sendMessage,
    getMessages,
    getGroupMessages,
}
