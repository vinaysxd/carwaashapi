const router = require('express').Router();
const bookingRoutes = require('../services/booking/routes');

router.use('/', bookingRoutes);

module.exports = router;
