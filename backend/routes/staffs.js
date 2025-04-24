var express = require('express');
var router = express.Router();
const { 
    getAllStaff, 
    getStaff, 
    getStaffById, 
    createStaff, 
    updateStaff, 
    deleteStaff 
} = require('../controllers/staffs');

// Lấy tất cả nhân viên
router.get('/', getAllStaff);

// Lấy nhân viên theo khách sạn
router.get('/hotel/:hotelId', getStaff);

// Lấy nhân viên theo ID
router.get('/:id', getStaffById);

// Tạo nhân viên mới
router.post('/', createStaff);

// Cập nhật nhân viên
router.put('/:id', updateStaff);

// Xóa nhân viên
router.delete('/:id', deleteStaff);

module.exports = router;