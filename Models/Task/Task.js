const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    dueDate: {
        type: Date,
        trim: true,
        required: true,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);