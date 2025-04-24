const { Staff } = require('../models/staff');

// Tạo nhân viên mới
async function createStaff (req, res) {
    const staff = new Staff(req.body);
    try {
        await staff.save();
        res.status(201).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy tất cả nhân viên
async function getAllStaff (req, res) {
    try {
        const staffs = await Staff.find().populate('hotelId');
        res.status(200).send(staffs);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Lấy nhân viên theo khách sạn
async function getStaff (req, res) {
    try {
        const staff = await Staff.find({ hotelId: req.params.hotelId }).populate('hotelId');
        res.status(200).send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Lấy nhân viên theo ID
async function getStaffById(req, res) {
    try {
        const staff = await Staff.findById(req.params.id).populate('hotelId');
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin nhân viên
async function updateStaff (req, res) {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!staff) {
            return res.status(404).send({ message: 'Staff not found' });
        }
        res.send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Xóa nhân viên
async function deleteStaff (req, res) {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).send({ message: 'Staff not found' });
        }
        res.send(staff);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    createStaff,
    getAllStaff,
    getStaff,
    getStaffById,
    updateStaff,
    deleteStaff
}