const { Booking } = require("../models/booking");
const { Room} = require('../models/rooms');

function Checkin(req,res){
    const bookingId = req.params.id;
    console.log('bookingId',bookingId);

    Booking.findById(bookingId)
    .then(booking => {
      console.log('booking',booking);
      if (!booking) return res.status(404).send('Booking not found');
      if (booking.customerId.toString() !== req.user.userId) return res.status(403).send('Forbidden');
      if (booking.status !== 'booked') return res.status(400).send('Cannot check-in');

      booking.status = 'checked-in';

      return booking.save()
        .then(() => Room.findByIdAndUpdate(booking.roomId, { $push: { bookingHistory: { event: 'check-in', date: new Date(), bookingId: booking._id } } }, { new: true }));
    })
    .then(() => res.send('Check-in successful'))
    .catch(err => res.status(500).send('Error checking in: ' + err));
}

function Checkout(req,res){
    const bookingId = req.params.id;

  Booking.findById(bookingId)
    .then(booking => {
      if (!booking) return res.status(404).send('Booking not found');
      if (booking.customerId.toString() !== req.user.userId) return res.status(403).send('Forbidden');
      if (booking.status !== 'checked-in') return res.status(400).send('Cannot check-out');

      booking.status = 'checked-out';

      return booking.save()
        .then(() => Room.findByIdAndUpdate(booking.roomId, { $push: { bookingHistory: { event: 'check-out', date: new Date(), bookingId: booking._id } } }, { new: true }));
    })
    .then(() => res.send('Check-out successful'))
    .catch(err => res.status(500).send('Error checking out: ' + err));
}

function Payment(req,res){
    const bookingId = req.params.id;
  const { paymentMethod } = req.body;

  Booking.findById(bookingId)
    .then(booking => {
      if (!booking) return res.status(404).send('Booking not found');
      if (booking.customerId.toString() !== req.user.userId) return res.status(403).send('Forbidden');
      if (booking.paymentStatus === 'paid') return res.status(400).send('Booking already paid');

      return Room.findById(booking.roomId)
        .then(room => {
          if (!room) return res.status(404).send('Room not found');

          booking.paymentStatus = 'paid';
          booking.paymentDetails = {
            amount: booking.tempayment,
            paymentDate: new Date(),
            paymentMethod,
            roomNumber: room.number
          };

          return booking.save()
            .then(() => Room.findByIdAndUpdate(room._id, { $push: { bookingHistory: { event: 'payment', date: new Date(), bookingId: booking._id, amount: booking.tempayment } } }, { new: true }));
        });
    })
    .then(() => res.send('Payment successful'))
    .catch(err => res.status(500).send('Error processing payment: ' + err));
}

module.exports = {
    Checkin,
    Checkout,
    Payment,
    
  }