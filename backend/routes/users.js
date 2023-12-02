var express = require('express');
var router = express.Router();
const { getUserInfo, createUser, login } = require('../controllers/users');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// router.get('/',findOneByUserId);
router.post('/signup', createUser);
router.post('/login', login);
// router.get('/info', getUserInfo);

module.exports = router;
