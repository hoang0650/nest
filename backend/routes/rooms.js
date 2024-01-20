var express = require('express');
var router = express.Router();
const { getallRooms, checkinRoom, checkoutRoom } = require('../controllers/rooms');
/* GET users listing. */
router.get('/', getallRooms);

// router.get('/',findOneByUserId);
router.post('/checkin', checkinRoom);
router.post('/checkout', checkoutRoom);


module.exports = router;