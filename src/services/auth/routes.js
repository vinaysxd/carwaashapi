const router = require('express').Router();
const controller = require('./controller');
const { authLimiter, otpLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const v = require('./validation');

router.post('/send-otp', otpLimiter, validate(v.sendOtp), controller.sendOtp);
router.post('/verify-otp', authLimiter, validate(v.verifyOtp), controller.verifyOtp);
router.post('/refresh-token', validate(v.refreshToken), controller.refreshToken);
router.post('/logout', validate(v.logout), controller.logout);

module.exports = router;
