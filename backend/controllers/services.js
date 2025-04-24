const { Service, ServiceOrder } = require('../models/service');
const mongoose = require('mongoose');

// ==== Quản lý dịch vụ ====

// Lấy danh sách dịch vụ theo khách sạn và danh mục
exports.getServices = async (req, res) => {
  try {
    const { hotelId, category } = req.query;
    
    const query = {};
    
    if (hotelId) {
      query.hotelId = hotelId;
    }
    
    if (category) {
      query.category = category;
    }
    
    const services = await Service.find(query).sort({ category: 1, name: 1 });
    
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy dịch vụ theo ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo dịch vụ mới
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category, hotelId, image, isAvailable } = req.body;
    
    const newService = new Service({
      name,
      description,
      price,
      category,
      hotelId,
      image,
      isAvailable
    });
    
    const savedService = await newService.save();
    
    res.status(201).json(savedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;
    
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          description,
          price,
          category,
          image,
          isAvailable,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );
    
    if (!updatedService) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    
    if (!deletedService) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.status(200).json({ message: 'Dịch vụ đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách danh mục dịch vụ theo khách sạn
exports.getServiceCategories = async (req, res) => {
  try {
    const { hotelId } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hotelId' });
    }
    
    const categories = await Service.distinct('category', { hotelId });
    
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==== Quản lý đơn hàng dịch vụ ====

// Tạo đơn hàng dịch vụ
exports.createServiceOrder = async (req, res) => {
  try {
    const { roomId, hotelId, services, totalAmount, notes } = req.body;
    
    if (!roomId || !hotelId || !services || !totalAmount) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    
    const newOrder = new ServiceOrder({
      roomId,
      hotelId,
      services,
      totalAmount,
      notes,
      requestTime: new Date(),
      status: 'pending'
    });
    
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateServiceOrderStatus = async (req, res) => {
  try {
    const { status, staffId } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái' });
    }
    
    const updatedOrder = await ServiceOrder.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          staffId: staffId || undefined,
          completedTime: status === 'completed' ? new Date() : undefined
        }
      },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy đơn hàng theo ID
exports.getServiceOrderById = async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id)
      .populate('services.serviceId')
      .populate('staffId', 'fullName');
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đơn hàng theo phòng
exports.getServiceOrdersByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const orders = await ServiceOrder.find({ roomId })
      .sort({ requestTime: -1 })
      .populate('services.serviceId')
      .populate('staffId', 'fullName');
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đơn hàng theo khách sạn với phân trang
exports.getServiceOrdersByHotel = async (req, res) => {
  try {
    const { hotelId, status, page = 1, limit = 20 } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hotelId' });
    }
    
    const query = { hotelId };
    
    if (status) {
      query.status = status;
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { requestTime: -1 },
      populate: [
        { path: 'services.serviceId' },
        { path: 'staffId', select: 'fullName' },
        { path: 'roomId', select: 'roomNumber' }
      ]
    };
    
    const totalCount = await ServiceOrder.countDocuments(query);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await ServiceOrder.find(query)
      .sort({ requestTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('services.serviceId')
      .populate('staffId', 'fullName')
      .populate('roomId', 'roomNumber');
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.status(200).json({
      orders,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa đơn hàng
exports.deleteServiceOrder = async (req, res) => {
  try {
    const deletedOrder = await ServiceOrder.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    res.status(200).json({ message: 'Đơn hàng đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};