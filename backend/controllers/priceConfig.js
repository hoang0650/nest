const { PriceConfig } = require("../models/priceConfig");
const { Hotel } = require("../models/hotel");
const { Room } = require("../models/rooms");

// Lấy tất cả cấu hình giá theo khách sạn
async function getPriceConfigs(req, res) {
  try {
    const { hotelId } = req.params;
    const priceConfigs = await PriceConfig.find({ 
      hotelId,
      isActive: true,
      $or: [
        { effectiveTo: { $exists: false } },
        { effectiveTo: null },
        { effectiveTo: { $gte: new Date() } }
      ]
    });
    
    res.status(200).json(priceConfigs);
  } catch (error) {
    console.error('Error fetching price configs:', error);
    res.status(500).json({ error: 'Lỗi khi lấy cấu hình giá' });
  }
}

// Lấy cấu hình giá theo loại phòng
async function getPriceConfigByRoomType(req, res) {
  try {
    const { hotelId, roomTypeId } = req.params;
    const priceConfig = await PriceConfig.findOne({ 
      hotelId,
      roomTypeId,
      isActive: true,
      $or: [
        { effectiveTo: { $exists: false } },
        { effectiveTo: null },
        { effectiveTo: { $gte: new Date() } }
      ]
    });
    
    if (!priceConfig) {
      return res.status(404).json({ error: 'Không tìm thấy cấu hình giá cho loại phòng này' });
    }
    
    res.status(200).json(priceConfig);
  } catch (error) {
    console.error('Error fetching price config:', error);
    res.status(500).json({ error: 'Lỗi khi lấy cấu hình giá theo loại phòng' });
  }
}

// Tạo cấu hình giá mới
async function createPriceConfig(req, res) {
  try {
    const { hotelId } = req.params;
    
    // Kiểm tra hotel tồn tại
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Không tìm thấy khách sạn' });
    }
    
    // Tạo cấu hình giá mới
    const newPriceConfig = new PriceConfig({
      ...req.body,
      hotelId
    });
    
    await newPriceConfig.save();
    
    // Cập nhật giá cho các phòng có cùng loại
    if (req.body.updateRooms === true) {
      const rooms = await Room.find({ 
        hotelId, 
        roomType: req.body.roomTypeId 
      });
      
      for (const room of rooms) {
        room.priceConfigId = newPriceConfig._id;
        room.hourlyRate = newPriceConfig.hourlyRates.firstHourPrice;
        room.firstHourRate = newPriceConfig.hourlyRates.firstHourPrice;
        room.additionalHourRate = newPriceConfig.hourlyRates.additionalHourPrice;
        room.dailyRate = newPriceConfig.dailyRates.standardPrice;
        room.nightlyRate = newPriceConfig.nightlyRates.standardPrice;
        await room.save();
      }
    }
    
    res.status(201).json(newPriceConfig);
  } catch (error) {
    console.error('Error creating price config:', error);
    res.status(400).json({ error: 'Lỗi khi tạo cấu hình giá mới' });
  }
}

// Cập nhật cấu hình giá
async function updatePriceConfig(req, res) {
  try {
    const { configId } = req.params;
    const updatedConfig = await PriceConfig.findByIdAndUpdate(
      configId,
      req.body,
      { new: true }
    );
    
    if (!updatedConfig) {
      return res.status(404).json({ error: 'Không tìm thấy cấu hình giá' });
    }
    
    // Cập nhật giá cho các phòng nếu được yêu cầu
    if (req.body.updateRooms === true) {
      const rooms = await Room.find({ 
        hotelId: updatedConfig.hotelId, 
        roomType: updatedConfig.roomTypeId,
        priceConfigId: updatedConfig._id
      });
      
      for (const room of rooms) {
        room.hourlyRate = updatedConfig.hourlyRates.firstHourPrice;
        room.firstHourRate = updatedConfig.hourlyRates.firstHourPrice;
        room.additionalHourRate = updatedConfig.hourlyRates.additionalHourPrice;
        room.dailyRate = updatedConfig.dailyRates.standardPrice;
        room.nightlyRate = updatedConfig.nightlyRates.standardPrice;
        await room.save();
      }
    }
    
    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error('Error updating price config:', error);
    res.status(400).json({ error: 'Lỗi khi cập nhật cấu hình giá' });
  }
}

// Vô hiệu hóa cấu hình giá
async function deactivatePriceConfig(req, res) {
  try {
    const { configId } = req.params;
    const config = await PriceConfig.findById(configId);
    
    if (!config) {
      return res.status(404).json({ error: 'Không tìm thấy cấu hình giá' });
    }
    
    config.isActive = false;
    config.effectiveTo = new Date();
    await config.save();
    
    res.status(200).json({ message: 'Đã vô hiệu hóa cấu hình giá' });
  } catch (error) {
    console.error('Error deactivating price config:', error);
    res.status(500).json({ error: 'Lỗi khi vô hiệu hóa cấu hình giá' });
  }
}

// Tính giá phòng dựa trên thời gian check-in/check-out
async function calculateRoomPrice(req, res) {
  try {
    const { roomId, checkInDate, checkOutDate, rateType } = req.body;
    
    const room = await Room.findById(roomId).populate('priceConfigId');
    if (!room) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
    
    // Lấy cấu hình giá từ phòng hoặc tìm cấu hình mặc định
    let priceConfig = room.priceConfigId;
    if (!priceConfig) {
      priceConfig = await PriceConfig.findOne({
        hotelId: room.hotelId,
        roomTypeId: room.roomType,
        isActive: true
      });
    }
    
    if (!priceConfig) {
      return res.status(404).json({ error: 'Không tìm thấy cấu hình giá cho phòng này' });
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    // Tính số giờ giữa check-in và check-out
    const durationInHours = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60));
    
    // Lấy giờ check-in
    const checkInHour = checkIn.getHours();
    
    let totalPrice = 0;
    let priceDetails = {};
    
    // Tính giá dựa trên loại giá và thời gian
    switch (rateType) {
      case 'hourly':
        // Giá giờ đầu
        totalPrice = priceConfig.hourlyRates.firstHourPrice;
        priceDetails.firstHourPrice = priceConfig.hourlyRates.firstHourPrice;
        
        // Tính giá cho các giờ tiếp theo
        if (durationInHours > 1) {
          const additionalHours = durationInHours - 1;
          const additionalPrice = additionalHours * priceConfig.hourlyRates.additionalHourPrice;
          totalPrice += additionalPrice;
          priceDetails.additionalHoursCount = additionalHours;
          priceDetails.additionalHoursPrice = additionalPrice;
        }
        
        // Chuyển sang tính giá ngày nếu vượt quá số giờ tối đa
        if (durationInHours > priceConfig.hourlyRates.maxHoursBeforeDay) {
          totalPrice = priceConfig.dailyRates.standardPrice;
          priceDetails = {
            basePrice: priceConfig.dailyRates.standardPrice,
            rateType: 'daily'
          };
        }
        break;
        
      case 'daily':
        // Tính số ngày (làm tròn lên)
        const durationInDays = Math.ceil(durationInHours / 24);
        totalPrice = durationInDays * priceConfig.dailyRates.standardPrice;
        priceDetails.basePrice = priceConfig.dailyRates.standardPrice;
        priceDetails.days = durationInDays;
        break;
        
      case 'nightly':
        // Kiểm tra xem thời gian check-in có phải ban đêm không
        if (checkInHour >= parseInt(priceConfig.nightlyRates.startTime.split(':')[0])) {
          // Tính số đêm (làm tròn lên)
          const durationInNights = Math.ceil(durationInHours / 24);
          totalPrice = durationInNights * priceConfig.nightlyRates.standardPrice;
          priceDetails.basePrice = priceConfig.nightlyRates.standardPrice;
          priceDetails.nights = durationInNights;
        } else {
          // Nếu không phải ban đêm, tính như giá ngày
          const durationInDays = Math.ceil(durationInHours / 24);
          totalPrice = durationInDays * priceConfig.dailyRates.standardPrice;
          priceDetails.basePrice = priceConfig.dailyRates.standardPrice;
          priceDetails.days = durationInDays;
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Loại giá không hợp lệ' });
    }
    
    res.status(200).json({
      roomId,
      totalPrice,
      priceDetails,
      durationInHours,
      rateType
    });
  } catch (error) {
    console.error('Error calculating room price:', error);
    res.status(500).json({ error: 'Lỗi khi tính giá phòng' });
  }
}

module.exports = {
  getPriceConfigs,
  getPriceConfigByRoomType,
  createPriceConfig,
  updatePriceConfig,
  deactivatePriceConfig,
  calculateRoomPrice
}; 