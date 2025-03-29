const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: [true, 'Please fill your first name'],
    },
    lName: {
        type: String,
        required: [true, 'Please fill your last name'],
    },
    email: {
        type: String,
        required: [true, 'Please fill your email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please fill your password'],
    },
    token: {
        type: String
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);