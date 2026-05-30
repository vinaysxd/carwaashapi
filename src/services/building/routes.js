const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const adminOnly = roleCheck(['admin', 'superadmin']);

router.post('/', auth, adminOnly, validate(v.createBuilding), controller.createBuilding);
router.get('/', controller.getBuildings);
router.get('/:id', controller.getBuildingById);
router.put('/:id', auth, adminOnly, validate(v.updateBuilding), controller.updateBuilding);

module.exports = router;
