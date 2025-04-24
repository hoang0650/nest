const { Room } = require("../models/rooms");
const { Hotel } = require("../models/hotel");
const { PriceConfig } = require("../models/priceConfig");
const { Service } = require("../models/services");
const { Booking } = require("../models/booking");
const { ServiceOrder } = require("../models/serviceOrder");
const mongoose = require('mongoose');

// Lấy tất cả phòng
async function getallRooms(req, res) {
  try {
    const { hotelId, floor } = req.query;
    
    // Tạo query dựa trên params
    const query = {};
    if (hotelId) query.hotelId = hotelId;
    if (floor) query.floor = parseInt(floor);
    
    const rooms = await Room.find(query);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng' });
  }
}

// Tạo phòng mới
async function createRoom(req, res) {
  try {
    const { hotelId, roomType, firstHourRate, additionalHourRate, dailyRate, nightlyRate } = req.body;
    
    // Tìm khách sạn
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }
    
    // Tìm cấu hình giá cho loại phòng này
    const priceConfig = await PriceConfig.findOne({
      hotelId,
      roomTypeId: roomType,
      isActive: true
    });
    
    // Tạo phòng mới
    const room = new Room({
      ...req.body,
      priceConfigId: priceConfig ? priceConfig._id : null,
      hourlyRate: priceConfig ? priceConfig.hourlyRates.firstHourPrice : (firstHourRate || req.body.hourlyRate),
      firstHourRate: priceConfig ? priceConfig.hourlyRates.firstHourPrice : firstHourRate,
      additionalHourRate: priceConfig ? priceConfig.hourlyRates.additionalHourPrice : additionalHourRate,
      dailyRate: priceConfig ? priceConfig.dailyRates.standardPrice : dailyRate,
      nightlyRate: priceConfig ? priceConfig.nightlyRates.standardPrice : nightlyRate
    });
    
      await room.save();
    
    // Cập nhật khách sạn
    hotel.rooms.push(room._id);
    await hotel.save();
    
      res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
      res.status(400).json({ message: error.message });
  }
}

// Lấy phòng theo ID
async function getRoomById(req, res) {
  try {
    const room = await Room.findById(req.params.id)
      .populate('priceConfigId')
      .populate('services');
      
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
      res.status(200).json(room);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}

// Cập nhật phòng
async function updateRoom(req, res) {
  try {
    const roomId = req.params.id;
    const updates = req.body;
    
    // Kiểm tra xem có cập nhật cấu hình giá không
    if (updates.priceConfigId) {
      const priceConfig = await PriceConfig.findById(updates.priceConfigId);
      if (priceConfig) {
        updates.hourlyRate = priceConfig.hourlyRates.firstHourPrice;
        updates.firstHourRate = priceConfig.hourlyRates.firstHourPrice;
        updates.additionalHourRate = priceConfig.hourlyRates.additionalHourPrice;
        updates.dailyRate = priceConfig.dailyRates.standardPrice;
        updates.nightlyRate = priceConfig.nightlyRates.standardPrice;
      }
    }
    
    const room = await Room.findByIdAndUpdate(roomId, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    
      res.status(200).json(room);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
}

// Xóa phòng
async function deleteRoom(req, res) {
  try {
    const roomId = req.params.id;
    
    // Kiểm tra xem phòng có đang được đặt không
    const activeBookings = await Booking.find({
      roomId,
      status: { $in: ['pending', 'confirmed', 'checked-in'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa phòng đang có đặt phòng đang hoạt động'
      });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    // Cập nhật danh sách phòng trong khách sạn
    await Hotel.findByIdAndUpdate(
      room.hotelId,
      { $pull: { rooms: roomId } }
    );
    
    // Xóa phòng
    await Room.findByIdAndDelete(roomId);
    
    res.status(200).json({ message: 'Đã xóa phòng thành công' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}

// Check-in
async function checkinRoom(req, res) {
  try {
    const { id: roomId } = req.params;
    const { customerId, staffId, checkInTime = new Date(), guestInfo } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
    
    if (room.roomStatus !== 'available') {
      return res.status(400).json({ error: 'Phòng không khả dụng để check-in' });
    }
    
    // Cập nhật phòng
    room.roomStatus = 'occupied';
        room.events.push({
      type: 'checkin',
      checkinTime: checkInTime,
      userId: customerId,
      staffId,
      guestInfo: guestInfo
    });
    
    await room.save();
    
    // Tạo booking nếu không có
    if (!req.body.bookingId) {
      const checkOutDate = new Date(checkInTime);
      checkOutDate.setHours(checkOutDate.getHours() + 1); // Mặc định 1 giờ
      
      // Prepare booking data
      const bookingData = {
        hotelId: room.hotelId,
        roomId: room._id,
        staffId,
        checkInDate: checkInTime,
        checkOutDate,
        status: 'checked-in',
        paymentStatus: 'pending',
        rateType: req.body.rateType || 'hourly',
        totalAmount: room.hourlyRate || room.firstHourRate,
        priceDetails: {
          basePrice: room.hourlyRate || room.firstHourRate,
          firstHourPrice: room.firstHourRate
        },
        actualCheckInTime: checkInTime,
        guestDetails: guestInfo || { name: 'Khách lẻ' }
      };
      
      // Chỉ thêm customerId nếu có
      if (customerId) {
        bookingData.customerId = customerId;
      }
      
      // Tạo và lưu booking, bỏ qua validate
      const booking = new Booking(bookingData);
      booking.validateSync = () => {}; // Bỏ qua validate
      await booking.save({ validateBeforeSave: false });
      
      // Thêm thông tin booking vào response
      room.currentBooking = booking._id;
      await room.save();
      
      return res.status(200).json({
        message: 'Check-in thành công',
        room,
        booking
      });
    }
    
    res.status(200).json({
      message: 'Check-in thành công',
      room
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Lỗi khi check-in' });
  }
}

// Check-out
async function checkoutRoom(req, res) {
  try {
    const { id: roomId } = req.params;
    const { bookingId, staffId, paymentMethod } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
    
    // Kiểm tra cả hai trạng thái 'active' và 'occupied'
    if (room.roomStatus !== 'occupied' && room.roomStatus !== 'active') {
      return res.status(400).json({ error: 'Phòng không ở trạng thái đang sử dụng' });
    }
    
    // Tìm booking liên quan
    const booking = bookingId 
      ? await Booking.findById(bookingId).populate('serviceOrders')
      : await Booking.findOne({
          roomId,
          status: 'checked-in'
        }).populate('serviceOrders').sort({ createdAt: -1 });
    
    if (!booking) {
      // Nếu không tìm thấy booking, vẫn cho phép check-out nhưng không cập nhật booking
      console.log('Không tìm thấy thông tin đặt phòng, chỉ cập nhật trạng thái phòng.');
    }
    
    const checkOutTime = new Date();
    
    // Cập nhật phòng
    room.roomStatus = 'dirty';
    
    // Tìm event check-in cuối cùng
    const lastCheckinEvent = room.events
      .filter(event => event.type === 'checkin')
      .sort((a, b) => new Date(b.checkinTime) - new Date(a.checkinTime))[0];
    
    if (lastCheckinEvent) {
      lastCheckinEvent.type = 'checkout';
      lastCheckinEvent.checkoutTime = checkOutTime;
      
      // Tính toán tiền phòng
      const checkinTime = new Date(lastCheckinEvent.checkinTime);
      const payment = calculatePayment(checkinTime, checkOutTime, room);
      lastCheckinEvent.payment = payment;
      
      // Cập nhật lịch sử phòng
      if (!room.bookingHistory) {
        room.bookingHistory = [];
      }
      
      room.bookingHistory.push({
        event: 'check-out',  // Thêm giá trị event bắt buộc
        checkInTime: checkinTime,
        checkOutTime: checkOutTime,
        date: checkOutTime, // Thêm date để đảm bảo đủ thông tin cần thiết
        customerName: booking ? (booking.guestDetails?.name || "Khách lẻ") : "Khách lẻ",
        customerPhone: booking ? booking.guestDetails?.phone : null,
        customerId: booking ? booking.customerId : null,
        staffId: staffId,
        staffName: booking && booking.staffName ? booking.staffName : "Nhân viên",
        amount: payment,  // Đổi totalAmount thành amount để khớp với schema
        totalAmount: payment + (booking?.serviceAmount || 0),
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'paid',
        notes: booking ? booking.notes : null
      });
      
      // Cập nhật doanh thu phòng
      if (!room.revenue) {
        room.revenue = { total: 0, history: [] };
      }
      
      room.revenue.total = (room.revenue.total || 0) + payment;
      room.revenue.history.push({
        date: checkOutTime,
        amount: payment,
        bookingId: booking ? booking._id : null
      });
      
      // Nếu có booking, cập nhật booking và dịch vụ
      if (booking) {
        // Tính tiền dịch vụ
        let serviceTotal = 0;
        if (booking.serviceOrders && booking.serviceOrders.length > 0) {
          for (const orderObj of booking.serviceOrders) {
            const order = await ServiceOrder.findById(orderObj);
            if (order && order.paymentStatus !== 'paid') {
              serviceTotal += order.totalAmount;
              
              // Cập nhật trạng thái thanh toán của dịch vụ
              order.paymentStatus = 'included_in_room_charge';
              await order.save();
            }
          }
        }
        
        // Cập nhật booking
        booking.checkOutDate = checkOutTime;
        booking.actualCheckOutTime = checkOutTime;
        booking.status = 'checked-out';
        booking.totalAmount = payment + serviceTotal;
        booking.serviceAmount = serviceTotal;
        booking.paymentDetails = {
          roomNumber: room.roomNumber,
          amount: payment + serviceTotal,
          checkInTime: booking.actualCheckInTime || booking.checkInDate,
          checkOutTime,
          paymentMethod: paymentMethod || 'cash',
          paymentDate: new Date()
        };
        
        // Thêm lịch sử thanh toán
        booking.paymentDetails.paymentHistory = [{
          amount: payment + serviceTotal,
          date: new Date(),
          method: paymentMethod || 'cash',
          staffId
        }];
        
        booking.paymentStatus = 'paid';
        
        await booking.save();
        
        // Cập nhật doanh thu khách sạn
        const hotel = await Hotel.findById(room.hotelId);
        if (hotel) {
          if (!hotel.revenue) {
            hotel.revenue = { daily: 0, total: 0, history: [] };
          }
          hotel.revenue.daily = (hotel.revenue.daily || 0) + payment + serviceTotal;
          hotel.revenue.total = (hotel.revenue.total || 0) + payment + serviceTotal;
          hotel.revenue.history.push({
            date: checkOutTime,
            amount: payment + serviceTotal,
            source: 'room'
          });
          await hotel.save();
        }
      }
    }
    
    await room.save();
    
    res.status(200).json({
      message: 'Check-out thành công',
      room,
      booking: booking || null
    });
  } catch (error) {
    console.error('Error checking out room:', error);
    res.status(500).json({ error: 'Lỗi khi check-out phòng: ' + error.message });
  }
}

// Dọn phòng
function cleanRoom(req, res) {
  try {
    const id = req.params.id;
    const { staffId } = req.body;
    
    if (!id) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
 
    Room.findById(id)
      .then((room) => {
        if (!room) {
          return res.status(404).json({ error: 'Không tìm thấy phòng' });
        }
        
        if (room.roomStatus !== 'dirty') {
          return res.status(400).json({ error: 'Phòng không ở trạng thái cần dọn dẹp' });
        }
        
        room.roomStatus = 'available';
        
        // Ghi lại lịch sử
        room.bookingHistory.push({
          event: 'cleaning',
          date: new Date(),
          staffId
        });
        
        room.save()
          .then(updatedRoom => {
            res.status(200).json({
              message: 'Phòng đã được dọn dẹp và sẵn sàng sử dụng',
              room: updatedRoom
            });
          });
      })
      .catch(error => {
        console.error('Error during clean room:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng' });
      });
  } catch (error) {
    console.error('Error during clean room:', error);
    res.status(500).json({ error: 'Lỗi khi dọn phòng' });
  }
}

// Gán dịch vụ cho phòng
async function assignServiceToRoom(req, res) {
  try {
    const { roomId, serviceId } = req.params;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
    }
    
    // Kiểm tra xem dịch vụ đã được gán cho phòng chưa
    if (room.services.includes(serviceId)) {
      return res.status(400).json({ error: 'Dịch vụ đã được gán cho phòng này' });
    }
    
    room.services.push(serviceId);
    await room.save();
    
    res.status(200).json({
      message: 'Đã gán dịch vụ cho phòng thành công',
      room
    });
  } catch (error) {
    console.error('Error assigning service to room:', error);
    res.status(500).json({ error: 'Lỗi khi gán dịch vụ cho phòng' });
  }
}

// Xóa dịch vụ khỏi phòng
async function removeServiceFromRoom(req, res) {
  try {
    const { roomId, serviceId } = req.params;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
    
    // Kiểm tra xem dịch vụ có được gán cho phòng không
    if (!room.services.includes(serviceId)) {
      return res.status(400).json({ error: 'Dịch vụ không được gán cho phòng này' });
    }
    
    room.services = room.services.filter(id => id.toString() !== serviceId);
    await room.save();
    
    res.status(200).json({
      message: 'Đã xóa dịch vụ khỏi phòng thành công',
      room
    });
  } catch (error) {
    console.error('Error removing service from room:', error);
    res.status(500).json({ error: 'Lỗi khi xóa dịch vụ khỏi phòng' });
  }
}

// Tính giá phòng
function calculatePayment(checkinTime, checkoutTime, room) {
  if (!checkinTime || !checkoutTime) {
    return 0;
  }
  
  // Tính số giờ giữa check-in và check-out
    const durationInHours = Math.ceil((checkoutTime - checkinTime) / (1000 * 60 * 60));
  const checkInHour = checkinTime.getHours();
  const checkOutHourLimit = 22; // Giờ bắt đầu tính qua đêm
  
    let payment = 0;

  // Trường hợp check-in sau 22h thì áp dụng giá qua đêm
  if (checkInHour >= checkOutHourLimit) {
    return room.nightlyRate;
  }
  
  // Xử lý dựa trên giá giờ đầu và giờ tiếp theo nếu có
  if (room.firstHourRate && room.additionalHourRate) {
    payment = room.firstHourRate;
    
    if (durationInHours > 1) {
      payment += (durationInHours - 1) * room.additionalHourRate;
    }
    
    // Nếu số giờ vượt quá 6-8 giờ, chuyển sang tính theo ngày
    if (durationInHours > 6) {
      payment = room.dailyRate;
    }
  } else {
    // Sử dụng cách tính cũ nếu không có giá giờ đầu và giờ tiếp theo
    payment = room.hourlyRate;
    
    if (durationInHours > 1) {
      if (room.roomType === 'fan') {
      payment += (durationInHours - 1) * 10000;
      } else if (room.roomType === 'single') {
      payment += (durationInHours - 1) * 15000;
      } else if (room.roomType === 'double') {
      payment += (durationInHours - 1) * 20000;
      }
    }
    
    if (durationInHours > 8 && durationInHours <= 12) {
      payment = room.nightlyRate;
    } else if (durationInHours > 12 && durationInHours <= 24) {
      payment = room.dailyRate;
    } else if (durationInHours > 24) {
      const nights = Math.ceil(durationInHours / 24);
      payment = room.dailyRate * nights;
    }
    }
  
    return payment;
}

// Lấy phòng khả dụng
async function getAvailableRooms(req, res) {
  try {
    const { hotelId, checkInDate, checkOutDate, floor } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp ID khách sạn' });
    }
    
    // Tạo query dựa trên params
    const query = {
      hotelId,
      roomStatus: 'available'
    };
    
    if (floor) query.floor = parseInt(floor);
    
    // Lấy tất cả phòng của khách sạn
    const rooms = await Room.find(query);
    
    if (checkInDate && checkOutDate) {
      // Lọc các phòng đã đặt trong khoảng thời gian này
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      
      // Tìm các booking trong khoảng thời gian này
      const bookings = await Booking.find({
        hotelId,
        $or: [
          {
            // Kiểm tra các booking có thời gian check-in nằm trong khoảng thời gian cần kiểm tra
            checkInDate: { $gte: startDate, $lt: endDate }
          },
          {
            // Kiểm tra các booking có thời gian check-out nằm trong khoảng thời gian cần kiểm tra
            checkOutDate: { $gt: startDate, $lte: endDate }
          },
          {
            // Kiểm tra các booking bao trùm khoảng thời gian cần kiểm tra
            checkInDate: { $lte: startDate },
            checkOutDate: { $gte: endDate }
          }
        ],
        status: { $in: ['pending', 'confirmed', 'checked-in'] }
      });
      
      // Lấy danh sách ID phòng đã đặt
      const bookedRoomIds = bookings.map(booking => booking.roomId.toString());
      
      // Lọc ra các phòng chưa đặt
      const availableRooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
      
      return res.status(200).json(availableRooms);
    }
    
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng khả dụng' });
  }
}

// Lấy phòng theo tầng
async function getRoomsByFloor(req, res) {
  try {
    const { hotelId, floor } = req.params;
    
    const rooms = await Room.find({
      hotelId,
      floor: parseInt(floor)
    });
    
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms by floor:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng theo tầng' });
  }
}

// Lấy danh sách các tầng của khách sạn
async function getHotelFloors(req, res) {
  try {
    const { hotelId } = req.params;
    
    // Lấy danh sách tầng duy nhất
    const floors = await Room.distinct('floor', { hotelId });
    
    // Sắp xếp theo thứ tự tăng dần
    floors.sort((a, b) => a - b);
    
    res.status(200).json({ floors });
  } catch (error) {
    console.error('Error fetching hotel floors:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách tầng của khách sạn' });
  }
}

// Lấy lịch sử phòng
const getRoomHistory = async (req, res) => {
  try {
    const { hotelId, roomId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    
    if (hotelId) {
      query.hotelId = hotelId;
    }
    
    if (roomId) {
      query._id = roomId;
    }
    
    // Lấy danh sách phòng phù hợp với điều kiện
    const rooms = await Room.find(query);
    
    // Tập hợp tất cả bookingHistory từ các phòng
    let allHistory = [];
    let totalPayment = 0;
    
    rooms.forEach(room => {
      if (room.bookingHistory && room.bookingHistory.length > 0) {
        // Thêm thông tin phòng vào mỗi lịch sử booking
        const roomHistoryWithDetails = room.bookingHistory.map(history => {
          // Tính tổng doanh thu
          if (history.totalAmount) {
            totalPayment += history.totalAmount;
          }
          
          return {
            ...history.toObject(),
            roomNumber: room.roomNumber,
            roomId: room._id,
            bookingId: history._id
          };
        });
        
        allHistory = [...allHistory, ...roomHistoryWithDetails];
      }
    });
    
    // Sắp xếp theo thời gian gần nhất (checkOutTime)
    allHistory.sort((a, b) => {
      return new Date(b.checkOutTime || b.checkInTime) - new Date(a.checkOutTime || a.checkInTime);
    });
    
    // Phân trang
    const totalItems = allHistory.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const paginatedHistory = allHistory.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      history: paginatedHistory,
      totalPages: totalPages,
      currentPage: parseInt(page),
      totalPayment: totalPayment
    });
  } catch (error) {
    console.error('Error in getRoomHistory:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử phòng', error: error.message });
  }
};

// Lấy chi tiết hóa đơn
const getInvoiceDetails = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Tìm phòng có bookingHistory chứa invoiceId
    const room = await Room.findOne({
      'bookingHistory._id': invoiceId
    }).populate('hotelId');
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Tìm booking history với ID tương ứng
    const history = room.bookingHistory.find(history => 
      history._id.toString() === invoiceId
    );
    
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Lấy thông tin khách sạn
    const hotel = room.hotelId;
    
    // Lấy thông tin checkout event (event cuối cùng)
    const latestEvents = room.events
      .filter(e => e.type === 'checkout')
      .sort((a, b) => new Date(b.checkoutTime) - new Date(a.checkoutTime));
    
    const checkoutEvent = latestEvents.length > 0 ? latestEvents[0] : null;
    const checkinEvent = checkoutEvent && checkoutEvent.checkinTime ? 
      { checkinTime: checkoutEvent.checkinTime } : 
      { checkinTime: history.date ? new Date(history.date.getTime() - 3600000) : new Date() }; // Giả định nhận phòng 1 giờ trước nếu không có dữ liệu
    
    // Tìm booking nếu có
    let booking = null;
    if (history.bookingId) {
      const Booking = mongoose.model('Booking');
      booking = await Booking.findById(history.bookingId);
    }
    
    // Tạo dữ liệu hóa đơn
    const invoiceData = {
      invoiceNumber: history._id,
      date: history.date || new Date(),
      customerName: booking ? booking.guestDetails?.name : "Khách lẻ",
      staffName: booking ? booking.staffName : "Nhân viên",
      roomNumber: room.roomNumber,
      checkInTime: checkinEvent.checkinTime || new Date(new Date(history.date).getTime() - 3600000),
      checkOutTime: checkoutEvent ? checkoutEvent.checkoutTime : history.date,
      products: [
        { name: `Tiền phòng ${room.roomNumber}`, price: history.amount || 0 }
      ],
      totalAmount: history.amount || 0,
      paymentMethod: booking && booking.paymentDetails ? booking.paymentDetails.paymentMethod : 'cash',
      
      // Thông tin khách sạn
      hotelId: hotel ? hotel._id : null,
      businessName: hotel ? hotel.name : "Khách sạn",
      business_address: hotel ? hotel.address : "",
      phoneNumber: hotel ? hotel.phoneNumber : ""
    };
    
    res.status(200).json(invoiceData);
  } catch (error) {
    console.error('Error in getInvoiceDetails:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết hóa đơn', error: error.message });
  }
};

// Cập nhật trạng thái phòng
async function updateRoomStatus(req, res) {
  try {
    const { id: roomId } = req.params;
    const { newStatus, staffId, notes } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Không tìm thấy phòng' });
    }
    
    // Kiểm tra có thể thay đổi trạng thái không
    if (room.roomStatus === 'occupied' && newStatus !== 'occupied') {
      return res.status(400).json({ 
        error: 'Không thể thay đổi trạng thái của phòng đang có khách' 
      });
    }
    
    // Lưu trạng thái cũ trước khi cập nhật
    const oldStatus = room.roomStatus;
    
    // Cập nhật trạng thái phòng
    room.roomStatus = newStatus;
    
    // Nếu là trạng thái phòng trống từ bảo trì, thêm vào lịch sử
    if (oldStatus === 'maintenance' && newStatus === 'available') {
      if (!room.bookingHistory) {
        room.bookingHistory = [];
      }
      
      room.bookingHistory.push({
        event: 'maintenance',
        date: new Date(),
        staffId: staffId,
        notes: notes || 'Đã hoàn thành bảo trì'
      });
    }
    
    await room.save();
    
    res.status(200).json({
      message: 'Cập nhật trạng thái phòng thành công',
      room
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng', details: error.message });
  }
}

// Chuyển phòng
async function transferRoom(req, res) {
  try {
    const { sourceRoomId, targetRoomId, staffId, notes } = req.body;
    
    // Kiểm tra phòng nguồn
    const sourceRoom = await Room.findById(sourceRoomId);
    if (!sourceRoom) {
      return res.status(404).json({ error: 'Không tìm thấy phòng nguồn' });
    }
    
    // Kiểm tra phòng đích
    const targetRoom = await Room.findById(targetRoomId);
    if (!targetRoom) {
      return res.status(404).json({ error: 'Không tìm thấy phòng đích' });
    }
    
    // Kiểm tra trạng thái phòng nguồn (phải đang có khách)
    if (sourceRoom.roomStatus !== 'occupied') {
      return res.status(400).json({ 
        error: 'Phòng nguồn phải đang có khách để chuyển phòng' 
      });
    }
    
    // Kiểm tra trạng thái phòng đích (phải trống)
    if (targetRoom.roomStatus !== 'available') {
      return res.status(400).json({ 
        error: 'Phòng đích phải đang trống để nhận khách' 
      });
    }
    
    // Tìm booking đang active của phòng nguồn
    const booking = await Booking.findOne({
      roomId: sourceRoomId,
      status: 'checked-in'
    });
    
    // Nếu có booking, cập nhật booking
    if (booking) {
      booking.roomId = targetRoomId;
      booking.roomNumber = targetRoom.roomNumber;
      booking.notes = (booking.notes || '') + `\nChuyển từ phòng ${sourceRoom.roomNumber} sang phòng ${targetRoom.roomNumber} - ${notes || 'Không có ghi chú'}`;
      
      await booking.save();
    }
    
    // Tìm event check-in cuối cùng của phòng nguồn
    const lastCheckinEvent = sourceRoom.events
      .filter(event => event.type === 'checkin')
      .sort((a, b) => new Date(b.checkinTime) - new Date(a.checkinTime))[0];
    
    if (lastCheckinEvent) {
      // Chuyển dữ liệu event từ phòng nguồn sang phòng đích
      targetRoom.events.push({
        ...lastCheckinEvent,
        transferredFrom: sourceRoom._id,
        transferredAt: new Date(),
        transferredBy: staffId,
        notes: notes
      });
      
      // Cập nhật currentBooking nếu có
      if (sourceRoom.currentBooking) {
        targetRoom.currentBooking = sourceRoom.currentBooking;
        sourceRoom.currentBooking = null;
      }
    }
    
    // Cập nhật trạng thái phòng
    sourceRoom.roomStatus = 'dirty';
    targetRoom.roomStatus = 'occupied';
    
    // Thêm vào lịch sử của phòng nguồn
    if (!sourceRoom.bookingHistory) {
      sourceRoom.bookingHistory = [];
    }
    
    sourceRoom.bookingHistory.push({
      event: 'transfer',
      date: new Date(),
      staffId: staffId,
      targetRoomId: targetRoomId,
      targetRoomNumber: targetRoom.roomNumber,
      notes: notes || 'Chuyển phòng'
    });
    
    // Lưu cả hai phòng
    await Promise.all([sourceRoom.save(), targetRoom.save()]);
    
    res.status(200).json({
      message: 'Chuyển phòng thành công',
      sourceRoom,
      targetRoom,
      booking: booking || null
    });
  } catch (error) {
    console.error('Error transferring room:', error);
    res.status(500).json({ error: 'Lỗi khi chuyển phòng', details: error.message });
  }
}

module.exports = {
  getallRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  checkinRoom,
  checkoutRoom,
  cleanRoom,
  assignServiceToRoom,
  removeServiceFromRoom,
  getAvailableRooms,
  getRoomsByFloor,
  getHotelFloors,
  getRoomHistory,
  getInvoiceDetails,
  updateRoomStatus,
  transferRoom
};