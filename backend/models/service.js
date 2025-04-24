const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho dịch vụ
const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware để cập nhật updatedAt
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Schema cho đơn hàng dịch vụ
const serviceOrderSchema = new Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  services: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestTime: {
    type: Date,
    default: Date.now
  },
  completedTime: {
    type: Date
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Pre-save middleware để cập nhật completedTime nếu trạng thái là completed
serviceOrderSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedTime) {
    this.completedTime = Date.now();
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);
const ServiceOrder = mongoose.model('ServiceOrder', serviceOrderSchema);

module.exports = { Service, ServiceOrder }; 