const router = require('express').Router();
const auth = require('../../middleware/auth');
const controller = require('./controller');

router.get('/my', auth, controller.getMyNotifications);
router.put('/read-all', auth, controller.markAllRead);
router.put('/:id/read', auth, controller.markRead);

module.exports = router;
