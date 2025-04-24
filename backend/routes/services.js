const express = require('express');
const router = express.Router();
const { 
  createService, 
  updateService, 
  deleteService, 
  getServiceById, 
  getServices, 
  getServiceCategories,
  createServiceOrder,
  updateServiceOrderStatus,
  getServiceOrderById,
  getServiceOrdersByRoom,
  getServiceOrdersByHotel,
  deleteServiceOrder
} = require('../controllers/services');

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Lấy danh sách dịch vụ
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Danh mục dịch vụ
 *     responses:
 *       200:
 *         description: Danh sách dịch vụ
 */
router.get('/', getServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Lấy dịch vụ theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dịch vụ
 *     responses:
 *       200:
 *         description: Chi tiết dịch vụ
 *       404:
 *         description: Không tìm thấy dịch vụ
 */
router.get('/:id', getServiceById);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Tạo dịch vụ mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               hotelId:
 *                 type: string
 *               image:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *             required:
 *               - name
 *               - price
 *               - category
 *               - hotelId
 *     responses:
 *       201:
 *         description: Dịch vụ đã được tạo
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', createService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Cập nhật dịch vụ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dịch vụ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Dịch vụ đã được cập nhật
 *       404:
 *         description: Không tìm thấy dịch vụ
 */
router.put('/:id', updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Xóa dịch vụ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dịch vụ
 *     responses:
 *       200:
 *         description: Dịch vụ đã được xóa
 *       404:
 *         description: Không tìm thấy dịch vụ
 */
router.delete('/:id', deleteService);

/**
 * @swagger
 * /services/categories:
 *   get:
 *     summary: Lấy danh sách danh mục dịch vụ
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *     responses:
 *       200:
 *         description: Danh sách danh mục dịch vụ
 */
router.get('/categories', getServiceCategories);

// ======= Quản lý đơn hàng dịch vụ =======

/**
 * @swagger
 * /services/orders:
 *   post:
 *     summary: Tạo đơn hàng dịch vụ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *               hotelId:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     serviceName:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *                     totalPrice:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *               notes:
 *                 type: string
 *             required:
 *               - roomId
 *               - hotelId
 *               - services
 *               - totalAmount
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/orders', createServiceOrder);

/**
 * @swagger
 * /services/orders/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái đơn hàng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *               staffId:
 *                 type: string
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng đã được cập nhật
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.patch('/orders/:id/status', updateServiceOrderStatus);

/**
 * @swagger
 * /services/orders/{id}:
 *   get:
 *     summary: Lấy đơn hàng theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get('/orders/:id', getServiceOrderById);

/**
 * @swagger
 * /services/orders/room/{roomId}:
 *   get:
 *     summary: Lấy đơn hàng theo phòng
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phòng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/orders/room/:roomId', getServiceOrdersByRoom);

/**
 * @swagger
 * /services/orders/hotel:
 *   get:
 *     summary: Lấy đơn hàng theo khách sạn
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Trạng thái đơn hàng
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng kết quả mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/orders/hotel', getServiceOrdersByHotel);

/**
 * @swagger
 * /services/orders/{id}:
 *   delete:
 *     summary: Xóa đơn hàng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Đơn hàng đã được xóa
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.delete('/orders/:id', deleteServiceOrder);

module.exports = router; 