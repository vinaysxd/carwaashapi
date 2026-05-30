const Joi = require('joi');

const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const createSubscription = Joi.object({
  plan_id: Joi.string().uuid().required(),
  vehicle_id: Joi.string().uuid().required(),
  building_id: Joi.string().uuid().required(),
  selected_days: Joi.array().items(Joi.string().valid(...validDays)).optional(),
  coupon_code: Joi.string().optional(),
});

module.exports = { createSubscription };
