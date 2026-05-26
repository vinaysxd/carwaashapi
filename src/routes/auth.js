const router = require('express').Router();
const authRoutes = require('../services/auth/routes');

router.use('/', authRoutes);

module.exports = router;
