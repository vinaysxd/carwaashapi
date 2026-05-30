const router = require('express').Router();
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

router.post('/customer', auth, validate(v.createProfile), controller.createProfile);
router.get('/customer', auth, controller.getProfile);
router.put('/customer', auth, validate(v.updateProfile), controller.updateProfile);

module.exports = router;
