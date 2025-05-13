const mongoose = require('mongoose');

const pricingPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  features: [{
    type: String
  }],
  permissions: [{
    type: String,
    enum: ['view', 'edit', 'delete', 'manage'],
    default: ['view']
  }],
  maxUsers: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
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
});

const PricingPackage = mongoose.model('PricingPackage', pricingPackageSchema);
module.exports = PricingPackage; 