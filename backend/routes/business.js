var express = require('express');
var router = express.Router();
const { createBusiness, deleteBusiness, updateBusiness, getAllBusinesses, getBusinessById } = require('../controllers/business'); // Thay đổi đường dẫn tới controller của bạn

// Route để lấy thông tin tất cả doanh nghiệp
router.get('/', getAllBusinesses);

// Route để lấy thông tin doanh nghiệp theo ID
router.get('/:id', getBusinessById);

// Route để tạo doanh nghiệp mới
router.post('/', createBusiness);

// Route để sửa doanh nghiệp theo ID
router.put('/:id', updateBusiness);

// Route để xoá doanh nghiệp theo ID
router.delete('/:id', deleteBusiness);

module.exports = router;
