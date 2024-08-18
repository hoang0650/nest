const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    hotelId: {type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel'},
    name: String,
    position: String,
    contact: {
        phone: String,
        email: String,
    },
    schedule:{
        day: Date,
        shift: String,
    }
})

const Staff = mongoose.model('Staff', staffSchema);
module.exports = { Staff }