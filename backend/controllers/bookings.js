const { Booking } = require("../models/booking");


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




module.exports = {
  calculateRoomCost,
  getBookingAndRoomDetails,
}