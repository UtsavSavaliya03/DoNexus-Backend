const express = require("express");
const router = new express.Router();
const taskController = require('../../Controllers/Task/TaskController.js');
const auth = require('../../Middleware/auth.js');

router.post("/add", auth, taskController?.addTask);
router.get("/list", auth, taskController?.getTasks);
router.patch("/completion/:taskId", auth, taskController?.updateTaskCompletion);
router.delete('/:taskId', auth, taskController?.deleteTask);
router.put('/update/:taskId', auth, taskController?.updateTask);

module.exports = router;