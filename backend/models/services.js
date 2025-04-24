const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    hotelId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true },
    description: String,
    type: { 
        type: String, 
        enum: ['food', 'beverage', 'amenity', 'other'], 
        required: true 
    },
    category: String,
    price: { type: Number, required: true },
    image: String,
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'piece' }, // piece, bottle, set, etc.
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

serviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = { Service }; 