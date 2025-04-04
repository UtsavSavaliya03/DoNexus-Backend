const express = require("express");
const router = new express.Router();
const taskController = require('../../Controllers/Task/TaskController.js');
const auth = require('../../Middleware/auth.js');

router.post("/add", auth, taskController?.addTask);
router.get("/list", auth, taskController?.getTasks);

module.exports = router;