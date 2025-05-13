const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/sepayController');

// Route đăng nhập SePay
router.post('/auth', sepayController.sepayLogin);
// Route lấy danh sách giao dịch từ SePay
router.get('/transactions', sepayController.getSepayTransactions);

module.exports = router; 