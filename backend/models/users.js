const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    blocked: {
        type: Boolean, default: false
    },
    online: {
        type: Boolean, default: false
    },
    role: { 
        type: String, 
        enum: ['admin', 'business', 'hotel', 'staff', 'customer'],
        default: 'customer',
        required: true, 
    },
    avatar: { type: String},
    loyaltyPoints: { type: Number, default: 0 },
    bookings: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Booking' }],
    offers: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Offer' }],
    hotelId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel' },
    businessId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Business' },
    permissions: {
        type: [{
            type: String,
            enum: ['view', 'create', 'edit', 'delete', 'manage_revenue']
        }],
        default: function() {
            if (this.role === 'admin') {
                return ['view', 'create', 'edit', 'delete', 'manage_revenue'];
            } else if (this.role === 'business') {
                return ['view', 'create', 'edit', 'delete', 'manage_revenue'];
            }
            return ['view'];
        }
    },
    createdAt: { type: Date, default: Date.now },
    loginHistory: [
        {
            loginDate: { type: Date, default: Date.now },
            ipAddress: String
        }
    ]
})

const User = mongoose.model('User', UserSchema);
module.exports = { User };