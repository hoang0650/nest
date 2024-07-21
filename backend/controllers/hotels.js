const { Hotel } = require('../models/hotel');

function createService(req, res) {
    const { hotelId } = req.params;
    const { name, description, quantity, price } = req.body;
    Hotel.findByIdAndUpdate(hotelId, { $push: { service: { name, description, quantity, price } } }, { new: true }).then(hotel => {
        if (!hotel) return res.status(404).send('Hotel not found');

        res.send('Service added successfully')
    }).catch(err => res.status(500).send('Error adding service: ' + err))
}

function editService(req, res) {
    const { hotelId, serviceId } = req.params;
    const { name, description, quantity, price } = req.body;
    Hotel.findOneAndUpdate({ _id: hotelId, "services._id": serviceId }, { $set: { "services.$.name": name, "services.$.description": description, "services.$.quantity": quantity, "services.$.price": price } },
        { new: true }
    ).then(hotel => {
        if (!hotel) return res.status(404).send('Hotel or service not found');

        res.send('Service updated successfully');
    })
        .catch(err => res.status(500).send('Error updating service: ' + err));
}

function deleteService(req, res) {
    const { hotelId, serviceId } = req.params;

    Hotel.findByIdAndUpdate(
        hotelId,
        { $pull: { services: { _id: serviceId } } },
        { new: true }
    )
        .then(hotel => {
            if (!hotel) return res.status(404).send('Hotel or service not found');

            res.send('Service deleted successfully');
        })
        .catch(err => res.status(500).send('Error deleting service: ' + err));
}

module.exports = {
    createService,editService,deleteService  
}