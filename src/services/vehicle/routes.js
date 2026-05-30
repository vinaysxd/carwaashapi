const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const customerOnly = roleCheck(['customer']);

router.post('/', auth, customerOnly, validate(v.createVehicle), controller.createVehicle);
router.get('/', auth, controller.getVehicles);
router.get('/:id', auth, controller.getVehicleById);
router.put('/:id', auth, validate(v.updateVehicle), controller.updateVehicle);
router.delete('/:id', auth, controller.deleteVehicle);

module.exports = router;
