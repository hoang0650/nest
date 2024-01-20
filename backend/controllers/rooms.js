const { Room } = require("../models/rooms");

async function getallRooms(req, res) {
  try {
    const rooms = await Room.find();
    res.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}


//check in
async function checkinRoom(req,res) {

  const room = await Room.findOneAndUpdate({ roomNumber: req.params.roomNumber },room.events.push({type: 'checkin', payment, roomStatus: 'active'}));

  // Calculate payment based on the duration or any other logic
  const payment = calculatePayment(room);
  res.status(200)
  // Check-in
  // room.events.push({ type: 'checkin', payment, roomStatus: 'active' });

  // await room.save();
}

//check out
async function checkoutRoom() {
  const room = await Room.findOne({ roomNumber: 101 });

  // Calculate additional payment or perform any necessary logic
  const additionalPayment = calculatePayment(room);

  // Check-out
  room.events.push({ type: 'checkout', payment: additionalPayment, roomStatus: 'dirty' });

  await room.save();
}

function calculatePayment(room) {
  const checkinEvent = room.events.find(event => event.type === 'checkin');
  const checkoutEvent = room.events.find(event => event.type === 'checkout') || { timestamp: new Date() };

  const checkinTime = checkinEvent.timestamp;
  const checkoutTime = checkoutEvent.timestamp;

  const durationInHours = Math.ceil((checkoutTime - checkinTime) / (1000 * 60 * 60)); // Convert milliseconds to hours

  let payment = 0;

  if (durationInHours <= 1) {
    payment = room.hourlyRate;
  } else if (durationInHours <= 24) {
    payment = room.dailyRate;
  } else {
    // For longer durations, calculate based on nightly rate
    const nights = Math.ceil(durationInHours / 24);
    payment = room.nightlyRate * nights;
  }

  return payment;
}


module.exports = {
  getallRooms,
  checkinRoom,
  checkoutRoom
}