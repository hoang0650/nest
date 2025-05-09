const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/sepayController');

// Route lấy danh sách giao dịch từ SePay
router.get('/transactions', sepayController.getSepayTransactions);

module.exports = router; 