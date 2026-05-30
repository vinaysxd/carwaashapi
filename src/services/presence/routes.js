const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const customerOnly = roleCheck(['customer']);

router.post('/checkin', auth, customerOnly, validate(v.checkIn), controller.checkIn);
router.post('/checkout', auth, customerOnly, controller.checkOut);
router.get('/today', auth, customerOnly, controller.getTodayPresence);

module.exports = router;
