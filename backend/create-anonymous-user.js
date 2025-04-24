const mongoose = require('mongoose');
const { User } = require('./models/users');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/phhotel', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      // Kiểm tra xem đã có user khách lẻ chưa
      let anonymousUser = await User.findOne({ email: 'anonymous@example.com' });
      
      if (!anonymousUser) {
        // Tạo user mới cho khách lẻ
        anonymousUser = new User({
          name: 'Khách lẻ',
          email: 'anonymous@example.com',
          password: 'anonymous123',
          role: 'customer',
          status: 'active'
        });
        
        await anonymousUser.save();
        console.log('Đã tạo user cho khách lẻ với ID:', anonymousUser._id);
      } else {
        console.log('User khách lẻ đã tồn tại với ID:', anonymousUser._id);
      }
      
      mongoose.disconnect();
    } catch (error) {
      console.error('Lỗi:', error);
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Lỗi kết nối database:', err);
  }); 