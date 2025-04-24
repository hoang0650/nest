const mongoose = require('mongoose');

const priceConfigSchema = new mongoose.Schema({
    hotelId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Hotel', required: true },
    roomTypeId: { type: String, required: true }, // Có thể là 'standard', 'deluxe', 'suite', etc.
    
    // Cấu hình giá theo giờ
    hourlyRates: {
        firstHourPrice: { type: Number, required: true }, // Giá giờ đầu tiên
        additionalHourPrice: { type: Number, required: true }, // Giá mỗi giờ tiếp theo
        maxHoursBeforeDay: { type: Number, default: 6 }, // Số giờ tối đa trước khi chuyển sang tính ngày
    },
    
    // Cấu hình giá theo ngày
    dailyRates: {
        standardPrice: { type: Number, required: true }, // Giá chuẩn theo ngày
        weekendSurcharge: { type: Number, default: 0 }, // Phụ thu cuối tuần (%)
        holidaySurcharge: { type: Number, default: 0 }, // Phụ thu ngày lễ (%)
        checkInTime: { type: String, default: '14:00' }, // Giờ check-in tiêu chuẩn
        checkOutTime: { type: String, default: '12:00' }, // Giờ check-out tiêu chuẩn
        latecheckOutFee: { type: Number, default: 0 }, // Phí trả phòng muộn (theo % giá phòng/giờ)
    },
    
    // Cấu hình giá theo đêm
    nightlyRates: {
        standardPrice: { type: Number, required: true }, // Giá chuẩn theo đêm
        startTime: { type: String, default: '22:00' }, // Thời gian bắt đầu tính qua đêm
        endTime: { type: String, default: '12:00' }, // Thời gian kết thúc (trưa hôm sau)
        weekendSurcharge: { type: Number, default: 0 }, // Phụ thu cuối tuần (%)
        holidaySurcharge: { type: Number, default: 0 }, // Phụ thu ngày lễ (%)
    },
    
    // Cấu hình chung
    discounts: [{
        type: { type: String, enum: ['loyalty', 'seasonal', 'promotion', 'group'] },
        value: { type: Number, default: 0 }, // % giảm giá
        startDate: Date,
        endDate: Date,
        minStay: { type: Number, default: 1 }, // Số đêm tối thiểu để áp dụng
        code: String, // Mã khuyến mãi nếu có
    }],
    
    // Trạng thái hoạt động
    isActive: { type: Boolean, default: true },
    effectiveFrom: { type: Date, default: Date.now },
    effectiveTo: Date,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

priceConfigSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const PriceConfig = mongoose.model('PriceConfig', priceConfigSchema);
module.exports = { PriceConfig }; 