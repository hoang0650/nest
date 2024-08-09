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
      lastCheckinEvent.checkoutTime = new Date();
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

function updateOptions(req, res) {
  
  try {
    const id = req.params.id;
    const selectedOption = req.body.selectedOption
    console.log('selectedOption',selectedOption)
    if (!id) {
      return res.status(404).json({ error: 'Room not found' });
    }
 
    Room.findByIdAndUpdate(id).
    then((room)=>{
      switch (selectedOption) {
        case 'night':
            room.options.isNight = true;
            room.options.isDay = false;
            return 'Qua đêm';
        case 'day':
            room.options.isNight = false;
            room.options.isDay = true;
            return 'Ngày đêm';
        case 'none':
            room.options.isNight = false;
            room.options.isDay = false;
            return 'Tính giờ';
        default: 'none';
    }
    if(selectedOption === 'night'){
      room.options.isNight = true;
      room.options.isDay = false;
    } else if(selectedOption === 'day'){
      room.options.isNight = false;
      room.options.isDay = true;
    } else {
      room.options.isNight = false;
      room.options.isDay = false;
    }
    console.log('selectedOption',selectedOption)
        room.save()
        res.status(200).json(room)
    }
  )
  } catch (error) {
    console.error('Error during clean room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


function calculatePayment(checkinTime, checkoutTime, data) {
  if(checkinTime && checkoutTime){
    const checkoutHour = checkinTime.getHours();
    const durationInHours = Math.ceil((checkoutTime - checkinTime) / (1000 * 60 * 60));
    const checkOutHourLimit = 22;
    let payment = 0;

    if(checkoutHour >= checkOutHourLimit){
      payment = data.nightlyRate
    }
  
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
  cleanRoom,
  updateOptions
}