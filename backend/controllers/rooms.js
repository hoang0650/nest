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

const eventHistory = function (action, actor) {
  return {
      action: action,
      actor: actor,
      timeChange: new Date()
  };
};


//check in
function checkinRoom(req, res) {
  
  try {
    const id = req.params.id;
    console.log('roomNumber',id);
    if (!id) {
      return res.status(404).json({ error: 'Room not found' });
    }
 
    Room.findByIdAndUpdate(id).
    then((room)=>{
        room.events.push({
          type:'checkin',
          checkinTime: new Date(),
          roomStatus:'active'
        })
        room.save()
        res.status(200).json(room)
    })
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


//check out
function checkoutRoom(req,res) {
  try {
    const id = req.params.id;
    console.log('roomNumber',id);
    if (!id) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    Room.findByIdAndUpdate(id).
    then((room)=>{
        const additionPayment = calculatePayment(room)
        room.events.push({
          type:'checkout',
          checkoutTime: new Date(),
          payment: additionPayment,
          roomStatus:'dirty'
        })
        room.save()
        res.status(200).json(room)
    })
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



function calculatePayment(room) {
  const checkinEvent = room.events.find(event => event.type === 'checkin');
  const checkoutEvent = room.events.find(event => event.type === 'checkout') || { timestamp: new Date() };
  if (!checkinEvent || !checkoutEvent) {
    // Handle the case where either checkin or checkout event is missing
    return 0;
  }
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