const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

router.post('/create-order', auth, customerOnly, controller.createOrder);
router.post('/verify', auth, controller.verifyPayment);
router.get('/my', auth, customerOnly, controller.getMyPayments);

module.exports = router;
