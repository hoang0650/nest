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
    const roomNumber = req.params.id;
    console.log('roomNumber',roomNumber);
    if (!roomNumber) {
      return res.status(404).json({ error: 'Room not found' });
    }
    // const room = await Room.find({roomNumber:roomNumber}).then(
    //   (data)=>{
    //     data.events={
    //       type: 'checkin',
    //       checkinTime: new Date(),
    //       roomStatus: 'active'
    //     }
    //     data.save();
    //     res.json(data);
    //   }
    // ).catch(err=>console.log(err));
    Room.findOne({roomNumber:roomNumber}).
    then((room)=>{
      console.log(113);
      if(!room.events || room.events == null){
        room.events.push({
          type: 'checkin',
          checkinTime: new Date(),
          roomStatus: 'active'
        })
      }
    })

    console.log(3);
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


//check out
async function checkoutRoom() {
  const roomId = req.params.id;
  try {
    const room = await Room.findById(roomId);
    const additionPayment = calculatePayment(room)
    room.events.type = 'checkout';
    room.events.checkoutTime = new Date();
    room.events.payment = additionPayment
    room.events.roomStatus = 'dirty';
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
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