const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const adminOnly = roleCheck(['admin', 'superadmin']);

router.get('/dashboard', auth, adminOnly, controller.getDashboard);
router.get('/jobs', auth, adminOnly, controller.getJobs);
router.put('/jobs/:id/reassign', auth, adminOnly, controller.reassignJob);
router.get('/subscribers', auth, adminOnly, controller.getSubscribers);
router.post('/coupons', auth, adminOnly, controller.createCoupon);
router.get('/coupons', auth, adminOnly, controller.getCoupons);
router.put('/coupons/:id/deactivate', auth, adminOnly, controller.deactivateCoupon);
router.post('/blocked-dates', auth, adminOnly, controller.blockDate);
router.get('/analytics', auth, adminOnly, controller.getAnalytics);

module.exports = router;
