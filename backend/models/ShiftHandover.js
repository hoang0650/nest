const mongoose = require('mongoose');

const shiftHandoverSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  fromStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  toStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  handoverTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  notes: {
    type: String
  },
  cashAmount: {
    type: Number,
    required: true
  },
  confirmedByPassword: {
    type: Boolean,
    default: false
  },
  confirmed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ShiftHandover = mongoose.model('ShiftHandover', shiftHandoverSchema);

module.exports = ShiftHandover; 