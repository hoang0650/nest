const express = require('express');
const router = express.Router();
const PricingPackage = require('../models/pricingPackage');
const User = require('../models/users');

// Lấy danh sách quyền có sẵn
router.get('/permissions', (req, res) => {
  res.json(['view', 'edit', 'delete', 'manage']);
});

// Lấy tất cả các gói
router.get('/', async (req, res) => {
  try {
    const packages = await PricingPackage.find();
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách gói',
      error: error.message 
    });
  }
});

// Lấy chi tiết một gói
router.get('/:id', async (req, res) => {
  try {
    const package = await PricingPackage.findById(req.params.id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói'
      });
    }
    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin gói',
      error: error.message
    });
  }
});

// Tạo gói mới
router.post('/', async (req, res) => {
  try {
    const { name, description, price, duration, features, permissions, maxUsers, isActive } = req.body;

    // Kiểm tra các trường bắt buộc
    const requiredFields = ['name', 'description', 'price', 'duration', 'maxUsers'];
    const missingFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`
      });
    }

    // Kiểm tra giá trị hợp lệ
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá không được nhỏ hơn 0'
      });
    }

    if (duration < 1) {
      return res.status(400).json({
        success: false,
        message: 'Thời hạn phải lớn hơn hoặc bằng 1 tháng'
      });
    }

    if (maxUsers < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số người dùng tối đa phải lớn hơn hoặc bằng 1'
      });
    }

    const newPackage = new PricingPackage({
      name,
      description,
      price,
      duration,
      features: features || [],
      permissions: permissions || ['view'],
      maxUsers,
      isActive: isActive !== undefined ? isActive : true
    });

    await newPackage.save();
    res.status(201).json({
      success: true,
      message: 'Tạo gói thành công',
      data: newPackage
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên gói đã tồn tại',
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo gói',
      error: error.message
    });
  }
});

// Cập nhật gói
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, duration, features, permissions, maxUsers, isActive } = req.body;
    
    const package = await PricingPackage.findById(req.params.id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói'
      });
    }

    // Cập nhật thông tin
    if (name) package.name = name;
    if (description) package.description = description;
    if (price !== undefined) package.price = price;
    if (duration !== undefined) package.duration = duration;
    if (features) package.features = features;
    if (permissions) package.permissions = permissions;
    if (maxUsers !== undefined) package.maxUsers = maxUsers;
    if (isActive !== undefined) package.isActive = isActive;
    package.updatedAt = Date.now();

    const updatedPackage = await package.save();
    res.json({
      success: true,
      message: 'Cập nhật gói thành công',
      data: updatedPackage
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên gói đã tồn tại',
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật gói',
      error: error.message
    });
  }
});

// Xóa gói
router.delete('/:id', async (req, res) => {
  try {
    const package = await PricingPackage.findById(req.params.id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói'
      });
    }

    await package.deleteOne();
    res.json({
      success: true,
      message: 'Xóa gói thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa gói',
      error: error.message
    });
  }
});

// Lấy danh sách người đăng ký
router.get('/subscribers/all', async (req, res) => {
  try {
    const users = await User.find({ pricingPackage: { $ne: null } })
      .populate('pricingPackage')
      .select('username email pricingPackage packageExpiryDate');

    const subscribers = users.map(user => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      packageId: user.pricingPackage?._id,
      packageName: user.pricingPackage?.name,
      expiryDate: user.packageExpiryDate
    }));

    res.json({
      success: true,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người đăng ký',
      error: error.message
    });
  }
});

// Đăng ký gói
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, packageId } = req.body;

    // Validate input
    if (!userId || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp userId và packageId'
      });
    }

    const package = await PricingPackage.findById(packageId);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Cập nhật thông tin gói cho user
    user.pricingPackage = packageId;
    user.packageExpiryDate = new Date(Date.now() + package.duration * 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      success: true,
      message: 'Đăng ký gói thành công',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi đăng ký gói',
      error: error.message
    });
  }
});

// Hủy đăng ký gói
router.post('/cancel', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp userId'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    user.pricingPackage = null;
    user.packageExpiryDate = null;
    await user.save();

    res.json({
      success: true,
      message: 'Hủy đăng ký gói thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi hủy đăng ký gói',
      error: error.message
    });
  }
});

module.exports = router; 