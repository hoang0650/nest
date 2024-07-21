const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: String,
    address: String,
    tax_code: Number,
    contact: {
        phone: String,
        email: String,
    },
    businessId: {type: mongoose.SchemaTypes.ObjectId, ref: 'Business'},
    rooms : [{type: mongoose.SchemaTypes.ObjectId, ref: 'Room'}],
    staff: [{type: mongoose.SchemaTypes.ObjectId, ref: 'Staff'}]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = {Hotel}