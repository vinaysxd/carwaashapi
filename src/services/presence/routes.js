const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

router.post('/checkin', auth, customerOnly, controller.checkIn);
router.post('/checkout', auth, customerOnly, controller.checkOut);
router.get('/today', auth, customerOnly, controller.getTodayPresence);

module.exports = router;
