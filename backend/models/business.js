const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: String,
    address: String,
    tax_code: Number,
    contact:{
        phone: String,
        email: String,
    },
    hotels: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel'}]
})

const Business = mongoose.model('Business', businessSchema)
module.exports = {Business};