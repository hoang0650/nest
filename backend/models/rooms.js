// roomSchema.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel' },
  roomNumber: {
    type: Number,
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  roomStatus: {
    type: String,
    enum: ['active', 'available', 'dirty'],
    default: 'available',
    required: true,
  },
  hourlyRate: {
    initial: {
      type: Number,
      required: true,
    },
    additional: {
      type: Number,
      required: true,
    }
  },
  dailyRate: {
    type: Number,
    required: true,
  },
  nightlyRate: {
    type: Number,
    required: true,
  },
  maxcount: {
    type: Number,
    required: true
  },
  imageurls: [],
  description: {
    type: String,
    required: true
  },
  bookingHistory: [
    {
      event: {
        type: String,
        enum: ['check-in', 'check-out', 'payment'],
        required: true,
      },
      date: Date,
      bookingId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Booking' },
      amount: Number // chỉ cho sự kiện 'payment'
    }
  ]
});

const Room = mongoose.model('Room', roomSchema);
module.exports = { Room };
