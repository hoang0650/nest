var express = require('express');
var router = express.Router();
const { calculateRoomCost,getBookingAndRoomDetails } = require('../controllers/bookings');
/* GET users listing. */
router.get('/:bookingId', getBookingAndRoomDetails);
router.put('/:bookingId', calculateRoomCost);
// router.post('/:bookingId/pay',Payment);




module.exports = router;