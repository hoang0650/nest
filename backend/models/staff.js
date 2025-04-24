const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    hotelId: {type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel', required: true},
    userId: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
    name: String,
    position: {
        type: String,
        enum: ['manager', 'receptionist', 'housekeeper', 'maintenance', 'other'],
        required: true
    },
    contact: {
        phone: String,
        email: String,
    },
    schedule: [{
        date: { type: Date },
        shift: { type: String, enum: ['morning', 'afternoon', 'night', 'full-day'] }
    }],
    permissions: {
        type: [{
            type: String,
            enum: ['view', 'create', 'edit', 'delete', 'manage_rooms', 'manage_bookings']
        }],
        default: ['view']
    },
    salary: {
        amount: { type: Number, default: 0 },
        paymentHistory: [{
            date: { type: Date },
            amount: { type: Number }
        }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

staffSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = { Staff }