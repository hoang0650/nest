const { Room } = require("../models/rooms");
const moment = require('moment-timezone');
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
          checkinTime: moment.utc(new Date()).utcOffset(16),
        })
        room.roomStatus ='active';
        room.save()
        res.status(200).json(room)
    })
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


//check out
async function checkoutRoom(req, res) {
  const roomId = req.params.id;
  
  try {
    const room = await Room.findById(roomId);

    // Find the last check-in event
    const lastCheckinEvent = room.events.reverse().find(event => event.type === 'checkin');
    
    if (lastCheckinEvent) {
      lastCheckinEvent.type = 'checkout';
      lastCheckinEvent.checkoutTime = moment.utc(new Date()).utcOffset(16);
      // Calculate and update the payment
      const payment = calculatePayment(lastCheckinEvent.checkinTime, lastCheckinEvent.checkoutTime,room);
      lastCheckinEvent.payment = payment;
      room.roomStatus = 'dirty';

      await room.save();
      
      res.json(room);
    } else {
      res.status(400).json({ error: 'No active check-in event found for the specified room.' });
    }
  } catch (error) {
    console.error('Error checking out room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//clean room
function cleanRoom(req, res) {
  
  try {
    const id = req.params.id;
    console.log('roomNumber',id);
    if (!id) {
      return res.status(404).json({ error: 'Room not found' });
    }
 
    Room.findByIdAndUpdate(id).
    then((room)=>{
        room.roomStatus ='available';
        room.save()
        res.status(200).json(room)
    })
  } catch (error) {
    console.error('Error during clean room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



function calculatePayment(checkinTime, checkoutTime, data) {
  if(checkinTime && checkoutTime){

    const durationInHours = Math.ceil((checkoutTime - checkinTime) / (1000 * 60 * 60));
  
    let payment = 0;
  
    payment += data.hourlyRate
  
    if (durationInHours <= 1) {
      payment = data.hourlyRate;
    } else if (durationInHours > 1 && durationInHours <= 8 && data.roomType === 'fan') {
      payment += (durationInHours - 1) * 10000;
    } else if (durationInHours > 1 && durationInHours <= 8 && data.roomType === 'single') {
      payment += (durationInHours - 1) * 15000;
    } else if (durationInHours > 1 && durationInHours <= 8 && data.roomType === 'double') {
      payment += (durationInHours - 1) * 20000;
    }
     else if (durationInHours > 8 && durationInHours <= 12) {
      // Nếu durationInHours > 8, cộng thêm 10$ cho mỗi giờ tiếp theo sau 8 giờ
      payment = data.nightlyRate;
    } else if (durationInHours > 12 && durationInHours <= 24){
      payment = data.dailyRate
    } else {
      const nights = Math.ceil(durationInHours / 24);
      payment = data.dailyRate * nights;
    }
  
    return payment;
  } else{
    return 0;
  }
}



module.exports = {
  getallRooms,
  checkinRoom,
  checkoutRoom,
  cleanRoom
}