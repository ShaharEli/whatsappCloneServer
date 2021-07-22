const Joi = require("joi");

const userValidationSchema = Joi.object({
  email: Joi.string().required().email(),
  firstName: Joi.string().required().min(2),
  lastName: Joi.string().required().min(2),
  phone: Joi.string().required().min(10),
  avatar: Joi.string(),
  password: Joi.string().required().min(6),
  publicKey: Joi.string().required().min(6),
});

module.exports = {
  userValidationSchema,
};
