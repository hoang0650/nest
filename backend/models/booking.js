const mongoose = require('mongoose');

const bookingHotelSchema = new mongoose.Schema({
  customerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  hotelId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel', required: true },
  roomId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Room', required: true },
  staffId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Staff' },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'pending',
    required: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'partially_paid', 'paid', 'refunded', 'cancelled'], 
    default: 'pending',
    required: true 
  },
  rateType: { type: String, enum: ['hourly', 'daily', 'nightly'], required: true },
  priceDetails: {
    basePrice: { type: Number, required: true },
    firstHourPrice: Number,
    additionalHoursCount: Number,
    additionalHoursPrice: Number,
    discountAmount: { type: Number, default: 0 },
    discountReason: String,
    taxAmount: { type: Number, default: 0 },
    serviceCharges: { type: Number, default: 0 }
  },
  totalAmount: { type: Number, required: true },
  additionalCharges: [{
    type: { type: String, enum: ['late_checkout', 'damage', 'minibar', 'other'] },
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now }
  }],
  serviceOrders: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'ServiceOrder'
  }],
  paymentDetails: {
    roomNumber: Number,
    amount: Number,
    checkInTime: Date,
    checkOutTime: Date,
    paymentMethod: { type: String, enum: ['cash', 'credit_card', 'banking', 'others'], default: 'cash', required: true },
    transactionId: String,
    paymentDate: Date,
    paymentHistory: [{
      amount: Number,
      date: { type: Date, default: Date.now },
      method: String,
      staffId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Staff' },
      transactionId: String
    }]
  },
  guestDetails: {
    name: String,
    email: String,
    phone: String,
    idType: String,
    idNumber: String
  },
  actualCheckInTime: Date,
  actualCheckOutTime: Date,
  services: [{
    serviceType: String,
    amount: Number,
    date: Date
  }],
  notes: String,
  logs: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    staffId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Staff' },
    details: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingHotelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Booking = mongoose.model('Booking', bookingHotelSchema)
module.exports = { Booking }