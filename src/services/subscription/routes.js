const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const customerOnly = roleCheck(['customer']);

router.get('/plans', controller.getPlans);
router.post('/', auth, customerOnly, validate(v.createSubscription), controller.createSubscription);
router.get('/my', auth, customerOnly, controller.getMySubscription);
router.put('/:id/pause', auth, customerOnly, controller.pauseSubscription);
router.put('/:id/cancel', auth, customerOnly, controller.cancelSubscription);

module.exports = router;
