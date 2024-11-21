var express = require('express');
var router = express.Router();
const meetingController = require('../controllers/meetingController')

router.get('/',meetingController.fetch_meeting)

router.post('/create', meetingController.create_meeting)

module.exports = router;