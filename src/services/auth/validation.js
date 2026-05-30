const Joi = require('joi');

const phone = Joi.string().pattern(/^\d{10}$/).required().messages({
  'string.pattern.base': 'phone_number must be exactly 10 digits',
});

const sendOtp = Joi.object({
  phone_number: phone,
});

const verifyOtp = Joi.object({
  phone_number: phone,
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'otp must be exactly 6 digits',
  }),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const logout = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { sendOtp, verifyOtp, refreshToken, logout };
