const router = require('express').Router();
const adminRoutes = require('../services/admin/routes');

router.use('/', adminRoutes);

module.exports = router;
