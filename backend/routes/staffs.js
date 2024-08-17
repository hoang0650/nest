var express = require('express');
var router = express.Router();
const { getStaff,getStaffById, createStaff, updateStaff, deleteStaff } = require('../controllers/staffs')

// Get all hotels
router.get('/', getStaff);
// Create a new hotel
router.get('/', getStaffById);
// Get a specific hotel by ID
router.post('/:id', createStaff);
// Update a hotel
router.put('/:id', updateStaff);
// Delete a hotel
router.delete('/:id', deleteStaff);

module.exports = router;