const Joi = require('joi');

const checkIn = Joi.object({
  building_id: Joi.string().uuid().required(),
  coordinates: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
});

module.exports = { checkIn };
