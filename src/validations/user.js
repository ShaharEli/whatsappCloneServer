const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().required().email(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
});

module.exports = {
  userSchema,
};
