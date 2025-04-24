var express = require('express');
var router = express.Router();
const { 
  getallRooms, 
  checkinRoom, 
  checkoutRoom, 
  cleanRoom, 
  getRoomById, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  assignServiceToRoom,
  removeServiceFromRoom,
  getAvailableRooms,
  getRoomsByFloor,
  getHotelFloors,
  getRoomHistory,
  getInvoiceDetails,
  updateRoomStatus,
  transferRoom
} = require('../controllers/rooms');

/* Các routes cho phòng */
// Lấy danh sách phòng
router.get('/', getallRooms);

// Lấy danh sách phòng khả dụng
router.get('/available', getAvailableRooms);

// Route cho lịch sử phòng
router.get('/history', getRoomHistory);

// Route để lấy chi tiết hóa đơn
router.get('/invoice/:invoiceId', getInvoiceDetails);

// Check-in phòng
router.post('/checkin/:id', checkinRoom);

// Check-out phòng
router.post('/checkout/:id', checkoutRoom);

// Dọn dẹp phòng
router.post('/clean/:id', cleanRoom);

// Cập nhật trạng thái phòng
router.patch('/:id/status', updateRoomStatus);

// Chuyển phòng
router.post('/transfer', transferRoom);

// Routes cho phòng theo tầng
router.get('/hotel/:hotelId/floor/:floor', getRoomsByFloor);
router.get('/hotel/:hotelId/floors', getHotelFloors);

// Gán dịch vụ cho phòng
router.post('/:roomId/services/:serviceId', assignServiceToRoom);

// Xóa dịch vụ khỏi phòng
router.delete('/:roomId/services/:serviceId', removeServiceFromRoom);

// Lấy thông tin chi tiết phòng - đặt route này sau cùng để tránh xung đột
router.get('/:id', getRoomById);

// Tạo phòng mới
router.post('/', createRoom);

// Cập nhật thông tin phòng
router.put('/:id', updateRoom);

// Xóa phòng
router.delete('/:id', deleteRoom);

module.exports = router;