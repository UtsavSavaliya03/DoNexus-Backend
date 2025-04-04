const User = require('../../Models/User/User.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { signupSchema, loginSchema } = require("../../Helpers/validator.js");

const createToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_TOKEN_SECRET_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRE_IN });
};

exports.signup = async (req, res, next) => {
    try {
        const validateResult = await signupSchema.validateAsync(req.body);

        const isUserExist = await User.findOne({ email: validateResult?.email });

        if (isUserExist !== null) {
            return res.status(400).json({
                status: false,
                message: "User already exist with this email.",
            });
        } else {
            let encryptedPassword = await bcrypt.hash(validateResult?.password, 10);

            const user = await User.create({
                fName: validateResult?.fName,
                lName: validateResult?.lName,
                email: validateResult?.email,
                password: encryptedPassword,
            }).then(() => {
                res.status(201).json({
                    status: true,
                    message: "User registered successfully.",
                });
            })

        }
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

exports.login = async (req, res, next) => {
    try {
        const validateResult = await loginSchema.validateAsync(req.body);

        await User.findOne({ email: validateResult?.email })
            .exec()
            .then((user) => {
                if (user === null) {
                    res.status(400).json({
                        status: false,
                        message: "User does not exist with this details."
                    })
                } else {
                    bcrypt.compare(validateResult?.password, user.password, async (err, result) => {
                        if (!result) {
                            return res.status(400).json({
                                status: false,
                                message: 'Password does not match.'
                            })
                        } else {
                            // Generate Token
                            user.password = undefined;

                            const token = createToken(user);

                            res.status(200).json({
                                status: true,
                                message: "Login successful.",
                                token: token,
                                data: user
                            })
                        }
                    })
                }
            })
            .catch((error) => {
                console.log('Error while login:', error);
                res.status(400).json({
                    status: false,
                    message: "Something went wrong, Please try again latter."
                })
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