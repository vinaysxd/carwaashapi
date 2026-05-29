const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

router.post('/', auth, customerOnly, controller.createVehicle);
router.get('/', auth, controller.getVehicles);
router.get('/:id', auth, controller.getVehicleById);
router.put('/:id', auth, controller.updateVehicle);
router.delete('/:id', auth, controller.deleteVehicle);

module.exports = router;
