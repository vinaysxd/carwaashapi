const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const adminOnly = roleCheck(['admin', 'superadmin']);

router.post('/', auth, adminOnly, controller.createBuilding);
router.get('/', controller.getBuildings);
router.get('/:id', controller.getBuildingById);
router.put('/:id', auth, adminOnly, controller.updateBuilding);

module.exports = router;
