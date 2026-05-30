const Joi = require('joi');

const createVehicle = Joi.object({
  make: Joi.string().required(),
  model: Joi.string().required(),
  colour: Joi.string().required(),
  plate_number: Joi.string().required(),
});

const updateVehicle = Joi.object({
  make: Joi.string().optional(),
  model: Joi.string().optional(),
  colour: Joi.string().optional(),
  plate_number: Joi.string().optional(),
});

module.exports = { createVehicle, updateVehicle };
