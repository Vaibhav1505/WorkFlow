var express = require('express');
var router = express.Router();
const taskController= require('../controllers/taskController')

router.get('/',taskController.fetch_tasks)

router.post('/create', taskController.create_task);

router.post('/delete/:id',taskController.delete_task)

module.exports= router;