var express = require('express');
var router = express.Router();
const userController= require('../controllers/userControllers')

/* GET users listing. */


router.get('/',userController.fetch_users)

router.post('/signup',userController.user_signup)

router.post('/signin',userController.user_signin)

module.exports = router;
