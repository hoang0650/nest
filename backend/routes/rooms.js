var express = require('express');
var router = express.Router();
const { getallRooms, checkinRoom, checkoutRoom,cleanRoom } = require('../controllers/rooms');
/* GET users listing. */
router.post('/checkin/:id', checkinRoom);
router.post('/checkout/:id', checkoutRoom);
router.post('/clean/:id',cleanRoom);
router.get('/', getallRooms);



module.exports = router;