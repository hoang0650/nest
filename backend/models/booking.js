const mongoose = require('mongoose');

const bookingHotel = new mongoose.Schema({
  customerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  roomId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Room' },
  checkInDate: Date,
  checkOutDate: Date,
  status: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' }, // pending, paid, cancelled
  paymentDetails: {
    roomNumber: Number, // thêm trường này
    amount: Number,
    checkInTime: Date,
    checkOutTime: Date,
    paymentMethod: { type: String, enum: ['cash', 'banking', 'others'], default: 'cash', required: true }, // e.g., cash, banking, etc.
  },
  tempayment: Number // thêm trường này
  // events: [
    //     {
    //         type: {
    //             type: String,
    //             enum: ['checkin', 'checkout', 'notpay'],
    //             required: true,
    //         },
    //         checkinTime: { type: Date },
    //         checkoutTime: { type: Date },
    //         payment: {
    //             type: Number,
    //             default: 0,
    //         },
    //     },
    // ],
});

const Booking = mongoose.model('Booking', bookingHotel)
module.exports = { Booking }