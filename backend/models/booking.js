const mongoose = require('mongoose');

const bookingHotelSchema = new mongoose.Schema({
  customerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  roomId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Room' },
  checkInDate: Date,
  checkOutDate: Date,
  status: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentDetails: {
    roomNumber: Number,
    amount: Number,
    checkInTime: Date,
    checkOutTime: Date,
    paymentMethod: { type: String, enum: ['cash', 'banking', 'others'], default: 'cash', required: true },
  },
  rateType: { type: String, enum: ['hourly', 'daily', 'nightly'], required: true }, // Add this field
});

const Booking = mongoose.model('Booking', bookingHotelSchema)
module.exports = { Booking }