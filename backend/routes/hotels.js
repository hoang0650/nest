var express = require('express');
var router = express.Router();
const { createService, editService, deleteService,
        createHotel,getHotels,getHotelById,updateHotel,deleteHotel } = require('../controllers/hotels');

// Get all hotels
router.get('/', getHotels);
// Create a new hotel
router.post('/', createHotel);
// Get a specific hotel by ID
router.get('/:id', getHotelById);
// Update a hotel
router.put('/:id', updateHotel);
// Delete a hotel
router.delete('/:id', deleteHotel);
// router.get('/',findOneByUserId);
router.post('/:id/services', createService);
router.put('/:id/services/:serviceId', editService);
router.delete('/:id/services/:serviceId', deleteService);

module.exports = router;