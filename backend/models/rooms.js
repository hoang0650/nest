const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: Number,
        required: true,
    },
    roomType: {
        type: String,
        required: true,
    },
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
    maxcount: {
        type: Number,
        required: true
    },
    imageurls: [],
    description: {
        type: String,
        required: true
    },
    events: [
        {
            type: {
                type: String,
                enum: ['checkin', 'checkout', 'notpay'],
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            payment: {
                type: Number,
                default: 0,
            },
            roomStatus: {
                type: String,
                enum: ['active', 'available', 'dirty'],
                required: true,
            },
        },
    ],
});

const Room = mongoose.model('Room', roomSchema);
module.exports = { Room };