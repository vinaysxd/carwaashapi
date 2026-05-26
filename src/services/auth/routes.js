const router = require('express').Router();
const controller = require('./controller');

router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', controller.logout);

module.exports = router;
