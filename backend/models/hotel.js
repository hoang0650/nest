const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: String,
    address: String,
    tax_code: Number,
    contact: {
        phone: String,
        email: String,
    },
    businessId: {type: mongoose.SchemaTypes.ObjectId, ref: 'Business', required: true},
    rooms: [{type: mongoose.SchemaTypes.ObjectId, ref: 'Room'}],
    staff: [{type: mongoose.SchemaTypes.ObjectId, ref: 'Staff'}],
    revenue: {
        total: { type: Number, default: 0 },
        daily: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 },
        history: [{
            date: { type: Date },
            amount: { type: Number, default: 0 },
            source: { type: String, enum: ['room', 'service', 'other'] }
        }]
    },
    occupancyRate: { type: Number, default: 0 }, // Tỷ lệ lấp đầy phòng
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

hotelSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = {Hotel}