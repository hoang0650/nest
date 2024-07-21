var express = require('express');
var router = express.Router();
const { createService, editService, deleteService } = require('../controllers/hotels');

// router.get('/',findOneByUserId);
router.post('/:hotelId/services', createService);
router.put('/:hotelId/services/:serviceId', editService);
router.delete('/:hotelId/services/:serviceId', deleteService);

module.exports = router;