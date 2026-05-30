const router = require('express').Router();
const controller = require('./controller');
const { authLimiter, otpLimiter } = require('../../middleware/rateLimiter');

router.post('/send-otp', otpLimiter, controller.sendOtp);
router.post('/verify-otp', authLimiter, controller.verifyOtp);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', controller.logout);

module.exports = router;
