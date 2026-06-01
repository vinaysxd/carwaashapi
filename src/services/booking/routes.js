const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

router.get('/services', controller.getServices);
router.get('/availability', controller.getAvailability);
router.post('/', auth, customerOnly, controller.createBooking);
router.get('/my', auth, customerOnly, controller.getMyBookings);
router.get('/:id', auth, customerOnly, controller.getBookingById);
router.put('/:id/cancel', auth, customerOnly, controller.cancelBooking);
router.put('/:id/key-dropped', auth, customerOnly, controller.confirmKeyDrop);

module.exports = router;
