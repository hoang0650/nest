var express = require('express');
var router = express.Router();
const { getallRooms, checkinRoom, checkoutRoom } = require('../controllers/rooms');
/* GET users listing. */
router.post('/checkin/:id', checkinRoom);
router.post('/checkout/:id', checkoutRoom);
router.get('/', getallRooms);

// router.get('/',findOneByUserId);


module.exports = router;