const router = require('express').Router();
const notificationRoutes = require('../services/notification/routes');

router.use('/', notificationRoutes);

module.exports = router;
