var express = require('express');
var router = express.Router();
const {sendMessage, getMessages, getGroupMessages }  = require('../controllers/chats'); // Thay đổi đường dẫn tới controller của bạn

// Load OTP endpoint (for demonstration, usually OTP is stored in a database)
router.get('/messages/:chatType/:id', getMessages);
// Get group message
app.get('/:groupId',getGroupMessages);
// Send email endpoint
router.post('/messages', sendMessage);

module.exports = router;

