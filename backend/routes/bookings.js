var express = require('express');
var router = express.Router();
const { Payment, Checkout, Checkin } = require('../controllers/bookings');
/* GET users listing. */
router.post('/:bookingId/checkin', Checkin);
router.post('/:bookingId/checkout', Checkout);
router.post('/:bookingId/pay',Payment);
// router.get('/', getallRooms);



module.exports = router;