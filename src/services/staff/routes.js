const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const adminOnly = roleCheck(['admin', 'superadmin']);

router.post('/', auth, adminOnly, validate(v.createStaff), controller.createStaff);
router.get('/', auth, adminOnly, controller.getAllStaff);
router.get('/:id', auth, adminOnly, controller.getStaffById);
router.put('/:id/approve', auth, adminOnly, controller.approveStaff);
router.put('/:id/deactivate', auth, adminOnly, controller.deactivateStaff);

module.exports = router;
