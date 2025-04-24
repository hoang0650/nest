const {Business} = require('../models/business')
const {Hotel} = require('../models/hotel')
const {User} = require('../models/users')
const jwt = require('jsonwebtoken')

async function createBusiness (req, res) {
    try {
        const businessData = req.body;
        
        // Lấy ownerId từ token JWT nếu có
        let ownerId = businessData.ownerId;
        
        if (!ownerId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Tìm user để lấy _id
                const user = await User.findOne({ userId: decoded.userId });
                if (user) {
                    ownerId = user._id;
                    businessData.ownerId = ownerId;
                }
            } catch (tokenError) {
                console.error('Error verifying token:', tokenError);
            }
        }
        
        // Kiểm tra nếu vẫn không có ownerId
        if (!businessData.ownerId) {
            return res.status(400).json({ error: 'ownerId is required' });
        }
        
        // Tạo instance của Business từ dữ liệu nhận được
        const newBusiness = new Business(businessData);
        
        // Lưu business trước để có _id
        const savedBusiness = await newBusiness.save();
        
        // Nếu có danh sách hotels được gửi lên
        if (businessData.hotels && businessData.hotels.length > 0) {
            // Cập nhật businessId cho mỗi hotel
            await Promise.all(businessData.hotels.map(hotelId => 
                Hotel.findByIdAndUpdate(hotelId, { businessId: savedBusiness._id })
            ));
            
            // Lấy thông tin business với hotels được populate
            const populatedBusiness = await Business.findById(savedBusiness._id).populate('hotels');
            return res.status(201).json(populatedBusiness);
        }
        
        // Cập nhật user đang đăng nhập với businessId mới
        await User.findByIdAndUpdate(ownerId, { businessId: savedBusiness._id });
        
        res.status(201).json(savedBusiness);
    } catch (error) {
        console.error('Error creating business:', error);
        res.status(400).json({ error: error.message });
    }
};

async function deleteBusiness (req, res) {
    try {
        const { id } = req.params;
        
        // Tìm business trước khi xóa để lấy thông tin
        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        
        // Xóa businessId từ người dùng là chủ sở hữu
        if (business.ownerId) {
            await User.findByIdAndUpdate(
                business.ownerId, 
                { $unset: { businessId: "" } }
            );
        }
        
        // Xóa businessId từ tất cả các hotels thuộc business này
        if (business.hotels && business.hotels.length > 0) {
            await Hotel.updateMany(
                { businessId: id }, 
                { $unset: { businessId: "" } }
            );
        }
        
        // Xóa business
        await Business.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Business deleted successfully' });
    } catch (error) {
        console.error('Error deleting business:', error);
        res.status(400).json({ error: error.message });
    }
};

async function updateBusiness (req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Lấy business hiện tại để so sánh danh sách hotels
        const currentBusiness = await Business.findById(id);
        if (!currentBusiness) {
            return res.status(404).json({ message: 'Business not found' });
        }
        
        // Nếu thay đổi ownerId, cập nhật mối quan hệ user-business
        if (updateData.ownerId && updateData.ownerId !== currentBusiness.ownerId.toString()) {
            // Xóa businessId của owner cũ
            await User.findByIdAndUpdate(
                currentBusiness.ownerId, 
                { $unset: { businessId: "" } }
            );
            
            // Cập nhật businessId cho owner mới
            await User.findByIdAndUpdate(
                updateData.ownerId, 
                { businessId: id }
            );
        }
        
        // Mảng chứa ID của các hotel hiện tại
        const currentHotels = currentBusiness.hotels.map(hotel => 
            hotel.toString ? hotel.toString() : hotel
        );
        
        // Xử lý danh sách hotels nếu được gửi lên
        if (updateData.hotels && Array.isArray(updateData.hotels)) {
            // Tìm các hotels mới được thêm vào
            const newHotels = updateData.hotels.filter(
                hotelId => !currentHotels.includes(hotelId)
            );
            
            // Tìm các hotels bị loại bỏ
            const removedHotels = currentHotels.filter(
                hotelId => !updateData.hotels.includes(hotelId)
            );
            
            // Cập nhật businessId cho các hotels mới
            if (newHotels.length > 0) {
                await Promise.all(newHotels.map(hotelId => 
                    Hotel.findByIdAndUpdate(hotelId, { businessId: id })
                ));
            }
            
            // Xóa businessId cho các hotels bị loại bỏ
            if (removedHotels.length > 0) {
                await Promise.all(removedHotels.map(hotelId => 
                    Hotel.findByIdAndUpdate(hotelId, { $unset: { businessId: "" } })
                ));
            }
        }
        
        // Cập nhật business
        const updatedBusiness = await Business.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).populate('hotels');
        
        res.status(200).json(updatedBusiness);
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(400).json({ error: error.message });
    }
};

async function updateBusinessStatus (req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Kiểm tra doanh nghiệp có tồn tại không
        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        
        // Kiểm tra status có hợp lệ không
        if (!['active', 'inactive', 'pending', 'block', 'reject', 'unactive'].includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status value. Must be one of: active, inactive, pending, block, reject, unactive' 
            });
        }
        
        // Cập nhật trạng thái
        const updatedBusiness = await Business.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        ).populate('hotels');
        
        res.status(200).json(updatedBusiness);
    } catch (error) {
        console.error('Error updating business status:', error);
        res.status(400).json({ error: error.message });
    }
};

async function getAllBusinesses (req, res) {
    try {
        const businesses = await Business.find().populate('hotels');
        res.status(200).json(businesses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function getBusinessById (req, res) {
    try {
        const { id } = req.params;
        const business = await Business.findById(id).populate('hotels');
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.status(200).json(business);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createBusiness,
    deleteBusiness,
    updateBusiness,
    updateBusinessStatus,
    getAllBusinesses,
    getBusinessById
  }