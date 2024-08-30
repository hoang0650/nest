const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  chatType: { type: String, enum: ['private', 'group'], default: 'private' },
  text: String,
  imageUrl: String,
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = {Message}