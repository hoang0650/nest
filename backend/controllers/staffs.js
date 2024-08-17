const { Staff } = require('../models/staff');

async function createStaff (req, res) {
    const staff = new Staff(req.body);
    try {
        await staff.save();
        res.status(201).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
};

async function getStaff (req, res) {
    try {
        const staff = await Staff.find({ hotelId: req.params.hotelId });
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
};

async function getStaffById(req, res) {
    try {
        const staff = await Staff.findById(req.params.id).populate('hotelId');
        if (!staff) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function updateStaff (req, res) {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!staff) {
            return res.status(404).send();
        }
        res.send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
};

async function deleteStaff (req, res) {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).send();
        }
        res.send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    createStaff,
    getStaff,
    getStaffById,
    updateStaff,
    deleteStaff
  }