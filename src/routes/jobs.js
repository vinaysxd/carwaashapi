const router = require('express').Router();
const jobRoutes = require('../services/job/routes');

router.use('/', jobRoutes);

module.exports = router;
