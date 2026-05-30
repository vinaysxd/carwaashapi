const Joi = require('joi');

const createBuilding = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  total_levels: Joi.number().integer().min(1).max(50).required(),
});

const updateBuilding = Joi.object({
  name: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  total_levels: Joi.number().integer().min(1).max(50).optional(),
});

module.exports = { createBuilding, updateBuilding };
