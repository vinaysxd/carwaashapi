const Joi = require('joi');

const createStaff = Joi.object({
  name: Joi.string().required(),
  phone_number: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'phone_number must be exactly 10 digits',
  }),
  building_id: Joi.string().uuid().required(),
});

module.exports = { createStaff };
