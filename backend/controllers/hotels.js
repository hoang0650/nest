const { Hotel } = require('../models/hotel');

function createService(req, res) {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;
    Hotel.findByIdAndUpdate(id, { $push: { service: { name, description, quantity, price } } }, { new: true }).then(hotel => {
        if (!hotel) return res.status(404).send('Hotel not found');

        res.send('Service added successfully')
    }).catch(err => res.status(500).send('Error adding service: ' + err))
}

function editService(req, res) {
    const { id, serviceId } = req.params;
    const { name, description, quantity, price } = req.body;
    Hotel.findOneAndUpdate({ _id: id, "services._id": serviceId }, { $set: { "services.$.name": name, "services.$.description": description, "services.$.quantity": quantity, "services.$.price": price } },
        { new: true }
    ).then(hotel => {
        if (!hotel) return res.status(404).send('Hotel or service not found');

        res.send('Service updated successfully');
    })
        .catch(err => res.status(500).send('Error updating service: ' + err));
}

function deleteService(req, res) {
    const { id, serviceId } = req.params;

    Hotel.findByIdAndUpdate(
        id,
        { $pull: { services: { _id: serviceId } } },
        { new: true }
    )
        .then(hotel => {
            if (!hotel) return res.status(404).send('Hotel or service not found');

            res.send('Service deleted successfully');
        })
        .catch(err => res.status(500).send('Error deleting service: ' + err));
}

async function createHotel(req, res)  {
    try {
        const hotel = new Hotel(req.body);
        await hotel.save();
        res.status(201).json(hotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getHotels(req, res) {
    try {
        const hotels = await Hotel.find().populate('businessId').populate('rooms').populate('staff');
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getHotelById(req, res) {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('businessId').populate('rooms').populate('staff');
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function updateHotel(req, res){
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(hotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

async function deleteHotel(req, res) {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json({ message: 'Hotel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createHotel,getHotels,getHotelById,updateHotel,deleteHotel,
    createService,editService,deleteService  
}