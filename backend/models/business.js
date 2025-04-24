const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    tax_code: { type: String, required: true, trim: true },
    contact: {
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
    },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'inactive', 'block', 'reject', 'unactive'], 
        default: 'pending'
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotels: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
    revenue: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

businessSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Business = mongoose.model('Business', businessSchema)
module.exports = {Business};