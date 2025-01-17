const Joi = require('joi');

const validateUser = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(30).optional(),
  });

  return schema.validate(data);
};

module.exports = {
  validateUser,
};
