const { User } = require('../models/users')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
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


function createUser(req, res) {
    const userData = req.body;
    function generateUniqueUserId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000);
    }
    User.create({ userId: generateUniqueUserId(), email: userData.email, username: userData.username, password: userData.password }).then(data => {
        res.status(200).send(data)
    }).catch(err => res.status(500).json({ err }))
}

function login(req, res) {
    const { password, email } = req.body;
    User.findOne({ email, password }).then(
        user => {
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const payloadData = {
                userId: user.userId,
                usename: user.usename,
                email: user.email,
                blocked: user.blocked,
                role: user.role
            }
            const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
                expiresIn: '30d'
            })
            res.json({ token })
        })
}

module.exports = {
    getUserInfo,
    createUser,
    login
}