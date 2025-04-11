const Task = require('../../Models/Task/Task.js');
const jwt = require('jsonwebtoken');
const { addTaskSchema } = require("../../Helpers/validator.js");

exports.addTask = async (req, res, next) => {
    try {
        const validateResult = await addTaskSchema.validateAsync(req.body);

        const token = (req?.headers?.authorization || req?.headers["authorization"])?.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY);
        const userId = decodedToken?.user?._id;

        const newTask = new Task({
            userId: userId,
            title: validateResult?.title,
            description: validateResult?.description,
            dueDate: validateResult?.dueDate
        });
        await newTask.save()
            .then((data) => {
                res.status(201).json({
                    status: true,
                    message: 'Task added successfully.',
                    data: data
                });
            })
    } catch (error) {
        if (error.isJoi === true) {
            return res.status(422).json({
                status: false,
                message: error?.details[0]?.message,
            });
        }
        next(error);
    }
};

exports.getTasks = async (req, res, next) => {
    try {
        const token = (req?.headers?.authorization || req?.headers["authorization"])?.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY);
        const userId = decodedToken?.user?._id;

        // Extract search query from request
        const { search } = req.query;

        // Create base query object
        const query = { userId: userId };

        // Add search condition if search query exists
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive title search
                { description: { $regex: search, $options: 'i' } } // Case-insensitive description search
            ];
        }

        const tasks = await Task.find(query);
        res.status(200).json({
            status: true,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTaskCompletion = async (req, res, next) => {
    try {
        // Verify authentication
        const token = (req?.headers?.authorization || req?.headers["authorization"])?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY);
        const userId = decodedToken?.user?._id;

        // Get task ID from URL params and new status from request body
        const { taskId } = req.params;
        const { isCompleted } = req.body;

        // Validate input
        if (!taskId) {
            return res.status(400).json({
                status: false,
                message: "Task ID is required."
            });
        }

        // Find and update the task
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId: userId },
            { isCompleted: isCompleted },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                status: false,
                message: "Task not found or you don't have permission to update it."
            });
        }

        res.status(200).json({
            status: true,
            message: "Task status updated successfully.",
            data: updatedTask
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        // Verify authentication
        const token = (req?.headers?.authorization || req?.headers["authorization"])?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY);
        const userId = decodedToken?.user?._id;

        // Get task ID from URL params
        const { taskId } = req.params;

        // Validate input
        if (!taskId) {
            return res.status(400).json({
                status: false,
                message: "Task ID is required."
            });
        }

        // Find and delete the task
        const deletedTask = await Task.findOneAndDelete({
            _id: taskId,
            userId: userId // Ensure user owns the task
        });

        if (!deletedTask) {
            return res.status(404).json({
                status: false,
                message: "Task not found or you don't have permission to delete it."
            });
        }

        res.status(200).json({
            status: true,
            message: "Task deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        // Verify authentication
        const token = (req?.headers?.authorization || req?.headers["authorization"])?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY);
        const userId = decodedToken?.user?._id;

        // Get task ID from URL params and update data from body
        const { taskId } = req.params;
        const { title, description, dueDate, isCompleted } = req.body;

        // Validate input
        if (!taskId) {
            return res.status(400).json({
                status: false,
                message: "Task ID is required."
            });
        }

        // Create update object with only provided fields
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

        // Check if at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: false,
                message: "At least one field (title, description, dueDate, or isCompleted) must be provided for update"
            });
        }

        // Find and update the task
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId: userId },
            updateData,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                status: false,
                message: "Task not found or you don't have permission to update it."
            });
        }

        res.status(200).json({
            status: true,
            message: "Task updated successfully.",
            data: updatedTask
        });
    } catch (error) {
        next(error);
    }
};