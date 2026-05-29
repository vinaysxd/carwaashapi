const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

router.get('/plans', controller.getPlans);
router.post('/', auth, customerOnly, controller.createSubscription);
router.get('/my', auth, customerOnly, controller.getMySubscription);
router.put('/:id/pause', auth, customerOnly, controller.pauseSubscription);
router.put('/:id/cancel', auth, customerOnly, controller.cancelSubscription);

module.exports = router;
