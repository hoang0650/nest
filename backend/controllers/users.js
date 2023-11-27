const {User} = require('../models/users')

function getUserInfo(req, res) {
    const userId = req.user.sub;
         User.findOne({userId:userId})
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
    // console.log(1111);
    const  userData = req.body;
    // console.log('user',user);
    // const existingUser =  User.findOne({email: user.email})
    // if(existingUser){
    //     console.log(1);
    //     return res.status(400).json({error: 'Account already exist'})
    // }
    function generateUniqueUserId() {
        // Logic để tạo giá trị duy nhất, ví dụ: sử dụng timestamp và một số ngẫu nhiên
        return Date.now().toString() + Math.floor(Math.random() * 1000);
      }
    console.log(2);
    User.create({userId:generateUniqueUserId(),email: userData.email,username: userData.username, password:userData.password}).then(data =>{
        console.log(3);
        res.status(200).send(data)
    }).catch(err=> res.status(500).json({err}))
}

module.exports = {
    getUserInfo,
    createUser
}