const { User } = require('../models/users')
const { Business } = require('../models/business')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config()

async function getUserInfo(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token không hợp lệ hoặc đã hết hạn
            console.error('Invalid token:', err.message);
        } else {
            // Token hợp lệ, decoded chứa payload
            res.json(decoded);
        }
    })
}


async function createUser(req, res) {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    function generateUniqueUserId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000);
    }
    User.create({ userId: generateUniqueUserId(), email: email, username: username, password: hashedPassword }).then(data => {
        res.status(200).send(data)
    }).catch(err => res.status(500).json({ err }))
}

function login(req, res) {
    const { password, email } = req.body;
    User.findOne({ email }).then(
        user => {
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return res.status(500).send('Error comparing passwords: ' + err);
                if (!isMatch) return res.status(400).send('Invalid password');
                console.log('user', user);
                const payloadData = {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    blocked: user.blocked,
                    role: user.role
                }
                const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
                    expiresIn: '30d'
                })
                const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                user.online = true
                user.loginHistory.push({ loginDate: new Date(), ipAddress });
                user.save()
                    .then(() => res.send({ message: 'Login successful', token }))
                    .catch(err => res.status(500).send('Error updating login history: ' + err));
            })
        })
        .catch(err => res.status(500).send('Error finding user: ' + err));
}

// Thêm chức năng đăng ký tài khoản doanh nghiệp
async function createBusinessUser(req, res) {
    try {
        const { username, email, password, businessInfo } = req.body;
        
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Tạo mã định danh người dùng mới
        function generateUniqueUserId() {
            return Date.now().toString() + Math.floor(Math.random() * 1000);
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 8);

        // Tạo người dùng mới với vai trò 'business'
        const newUser = new User({
            userId: generateUniqueUserId(),
            email,
            username,
            password: hashedPassword,
            role: 'business'
        });

        // Lưu người dùng
        await newUser.save();

        // Tạo thông tin doanh nghiệp
        const newBusiness = new Business({
            name: businessInfo.name,
            address: businessInfo.address,
            tax_code: businessInfo.tax_code,
            contact: {
                phone: businessInfo.contact?.phone,
                email: businessInfo.contact?.email || email
            },
            ownerId: newUser._id
        });

        // Lưu thông tin doanh nghiệp
        const savedBusiness = await newBusiness.save();

        // Cập nhật thông tin businessId cho người dùng
        newUser.businessId = savedBusiness._id;
        await newUser.save();

        res.status(201).json({
            user: {
                userId: newUser.userId,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            business: savedBusiness
        });
    } catch (error) {
        console.error('Error creating business user:', error);
        res.status(500).json({ message: 'Lỗi khi tạo tài khoản doanh nghiệp', error: error.message });
    }
}

// Lấy danh sách người dùng theo vai trò
async function getUsersByRole(req, res) {
    try {
        const { role } = req.params;
        
        // Kiểm tra vai trò hợp lệ
        const validRoles = ['admin', 'business', 'hotel', 'staff', 'customer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }
        
        // Tìm người dùng theo vai trò
        const users = await User.find({ role }).select('-password');
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users by role:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
    }
}

// Cập nhật thông tin người dùng
async function updateUser(req, res) {
    try {
        const { userId } = req.params;
        const updates = req.body;
        
        // Không cho phép cập nhật mật khẩu qua route này
        if (updates.password) {
            delete updates.password;
        }
        
        // Cập nhật thông tin người dùng
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin người dùng', error: error.message });
    }
}

// Khóa/mở khóa tài khoản người dùng
async function toggleUserBlock(req, res) {
    try {
        const { userId } = req.params;
        const { blocked } = req.body;
        
        if (typeof blocked !== 'boolean') {
            return res.status(400).json({ message: 'Trạng thái blocked phải là boolean' });
        }
        
        // Tìm và cập nhật trạng thái blocked của người dùng
        const user = await User.findOneAndUpdate(
            { userId: userId },
            { $set: { blocked } },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        res.status(200).json({
            message: blocked ? 'Tài khoản đã bị khóa' : 'Tài khoản đã được mở khóa',
            user
        });
    } catch (error) {
        console.error('Error toggling user block status:', error);
        res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái khóa tài khoản', error: error.message });
    }
}

// Đổi mật khẩu người dùng
async function changePassword(req, res) {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        // Kiểm tra mật khẩu mới
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }
        
        // Tìm người dùng
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }
        
        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 8);
        
        // Cập nhật mật khẩu
        user.password = hashedNewPassword;
        await user.save();
        
        res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Lỗi khi đổi mật khẩu', error: error.message });
    }
}

module.exports = {
    getUserInfo,
    createUser,
    login,
    createBusinessUser,
    getUsersByRole,
    updateUser,
    toggleUserBlock,
    changePassword
}