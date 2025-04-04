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

        const tasks = await Task.find({ userId: userId });
        res.status(200).json({
            status: true,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};