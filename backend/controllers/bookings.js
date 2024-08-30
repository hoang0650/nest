const { Booking } = require("../models/booking");
const { Room} = require('../models/rooms')

const calculateRoomCost = async (bookingId) => {
  try {
    const booking = await getBookingAndRoomDetails(bookingId);
    if (!booking) throw new Error('Booking not found');

    const { checkInDate, checkOutDate, roomId, rateType } = booking;
    const room = booking.roomId;
    
    if (!room) throw new Error('Room not found');
    
    const duration = calculateDuration(checkInDate, checkOutDate);
    const checkoutHour = checkinTime.getHours();
    const checkOutHourLimit = 22;
    
    let totalCost;
    if(checkoutHour >= checkOutHourLimit) return totalCost = room.nightlyRate
    switch (rateType) {
      case 'hourly':
        totalCost += calculateHourlyCost(room.hourlyRate, booking.checkInDate, booking.checkOutDate);
        break;
      case 'daily':
        totalCost = calculateDailyCost(room.dailyRate, duration);
        break;
      case 'nightly':
        totalCost = calculateNightlyCost(room.nightlyRate, duration);
        break;
      default:'hourly'
        throw new Error('Unknown rate type');
    }

    return totalCost;
  } catch (error) {
    console.error('Error calculating room cost:', error);
  }
};


const getBookingAndRoomDetails = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('roomId') // Populate the roomId field to get room details
      .exec();

    return booking;
  } catch (error) {
    console.error('Error retrieving booking and room details:', error);
  }
};

// costCalculation.js
const calculateHourlyCost = (hourlyRate, checkInTime, checkOutTime) => {
  const durationInHours = Math.max((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60), 0);
  
  if (durationInHours <= 1) {
    return hourlyRate.initial;
  } else {
    return hourlyRate.initial + (durationInHours - 1) * hourlyRate.additional;
  }
};

const calculateDailyCost = (dailyRate, duration) => {
  return dailyRate * duration;
};

const calculateNightlyCost = (nightlyRate, duration) => {
  return nightlyRate * duration;
};

const calculateDuration = (checkInDate, checkOutDate) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((checkOutDate - checkInDate) / millisecondsPerDay);
};

const checkout = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('roomId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking không tồn tại' });
    }

    const checkOutTime = new Date();
    booking.checkOutDate = checkOutTime;

    const checkInTime = booking.checkInDate;
    const rateType = booking.rateType;
    const room = booking.roomId;
    let amount = 0;

    // Tính toán số tiền dựa trên rateType
    if (rateType === 'hourly') {
      const hoursStayed = Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60)); // Chuyển đổi từ mili giây sang giờ
      amount = hoursStayed * room.hourlyRate;
    } else if (rateType === 'daily') {
      const daysStayed = Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)); // Chuyển đổi từ mili giây sang ngày
      amount = daysStayed * room.dailyRate;
    } else if (rateType === 'nightly') {
      const nightsStayed = Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)); // Tính số đêm ở lại
      amount = nightsStayed * room.nightlyRate;
    }

    booking.paymentDetails.amount = amount;
    booking.paymentStatus = 'pending';
    booking.status = 'checked-out';

    await booking.save();

    res.status(200).json({ message: 'Check-out thành công!', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình check-out.' });
  }
};





module.exports = {
  calculateRoomCost,
  getBookingAndRoomDetails,
}