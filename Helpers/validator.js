const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(20).required(),
});

const signupSchema = Joi.object({
  fName: Joi.string().trim().required(),
  lName: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().trim().min(8).max(20).required(),
  confirmPassword: Joi.string().trim().min(8).max(20).valid(Joi.ref("password")).required(),
});

const addTaskSchema = Joi.object({
  title: Joi.string().trim()?.required(),
  description: Joi.string().trim()?.required(),
  dueDate: Joi.date().required(),
});

module.exports = {
  loginSchema,
  signupSchema,
  addTaskSchema
};