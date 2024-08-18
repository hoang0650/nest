var express = require('express');
var router = express.Router();
const { getallRooms, checkinRoom, checkoutRoom,cleanRoom,getRoomById,createRoom,updateRoom,deleteRoom } = require('../controllers/rooms');
/* GET users listing. */
router.post('/checkin/:id', checkinRoom);
router.post('/checkout/:id', checkoutRoom);
router.post('/clean/:id',cleanRoom);
router.get('/', getallRooms);
router.get('/:id', getRoomById);
router.post('/', createRoom);
router.put('/:id',updateRoom);
router.delete('/:id', deleteRoom);



module.exports = router;