const Joi = require('joi');

const createProfile = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional(),
});

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});

module.exports = { createProfile, updateProfile };
