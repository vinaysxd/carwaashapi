const router = require('express').Router();
const auth = require('../../middleware/auth');
const controller = require('./controller');

router.post('/customer', auth, controller.createProfile);
router.get('/customer', auth, controller.getProfile);
router.put('/customer', auth, controller.updateProfile);

module.exports = router;
