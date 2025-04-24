// roomSchema.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel', required: true },
  roomNumber: {
    type: Number,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
    default: 1
  },
  roomType: {
    type: String,
    required: true,
  },
  roomStatus: {
    type: String,
    enum: ['active', 'available', 'occupied', 'maintenance', 'dirty', 'cleaning'],
    default: 'available',
    required: true,
  },
  priceConfigId: { type: mongoose.SchemaTypes.ObjectId, ref: 'PriceConfig' },
  hourlyRate: {
    type: Number,
    required: true,
  },
  dailyRate: {
    type: Number,
    required: true,
  },
  nightlyRate: {
    type: Number,
    required: true,
  },
  firstHourRate: { type: Number },
  additionalHourRate: { type: Number },
  maxcount: {
    type: Number,
    required: true
  },
  imageurls: [],
  description: {
    type: String,
    required: true
  },
  amenities: [String],
  services: [{
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'Service'
  }],
  revenue: {
    total: { type: Number, default: 0 },
    history: [{
      date: { type: Date },
      amount: { type: Number, default: 0 },
      bookingId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Booking' }
    }]
  },
  events: [
    {
        type: {
            type: String,
            enum: ['checkin', 'checkout', 'notpay', 'maintenance', 'service_order'],
            required: true,
        },
        checkinTime: { type: Date },
        checkoutTime: { type: Date },
        payment: {
            type: Number,
            default: 0,
        },
        userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        staffId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Staff' },
        serviceOrderId: { type: mongoose.SchemaTypes.ObjectId, ref: 'ServiceOrder' },
    },
  ],
  bookingHistory: [
    {
      event: {
        type: String,
        enum: ['check-in', 'check-out', 'payment', 'maintenance', 'cleaning', 'service'],
        required: true,
      },
      date: { type: Date, default: Date.now },
      bookingId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Booking' },
      userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
      staffId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Staff' },
      amount: Number,
      additionalCharges: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalAmount: Number,
      serviceDetails: {
        serviceOrderId: { type: mongoose.SchemaTypes.ObjectId, ref: 'ServiceOrder' },
        amount: Number
      }
    }
  ],
  rateType: { type: String, enum: ['hourly', 'daily', 'nightly'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = { Room };
