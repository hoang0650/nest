const {User} = require('../models/users')
const jwt = require('jsonwebtoken')
function getUserInfo(req, res) {
    const email = req.user.sub;
         User.findOne({email:email})
        .then((user) => {
            if (user) {
                res.status(200).json({blocked:user.blocked, roles: user.roles})
                
            } else {
                res.status(200).json({})
            }
        })
        .catch((err) => {
            res.status(500).json({ msg: err.message });
        });      
}

function createUser(req,res) {
    const  userData = req.body;
    function generateUniqueUserId() {
        // Logic để tạo giá trị duy nhất, ví dụ: sử dụng timestamp và một số ngẫu nhiên
        return Date.now().toString() + Math.floor(Math.random() * 1000);
      }
    User.create({userId:generateUniqueUserId(),email: userData.email,username: userData.username, password:userData.password}).then(data =>{
        res.status(200).send(data)
    }).catch(err=> res.status(500).json({err}))
}

function login(req,res){
    const {username,password} = req.body;
    const user = User.findOne({username,password})
    if(!user){
        return res.status(401).json({message:'Invalid credentials'});
    }
    const token = jwt.sign({userId: user.userId},process.JWT_SECRET,{
        expiresIn: '1M'
    })
    res.json({token})
}

module.exports = {
    getUserInfo,
    createUser,
    login
}