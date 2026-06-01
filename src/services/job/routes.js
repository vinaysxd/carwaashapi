const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const staffOnly = roleCheck(['staff']);

router.get('/my-today', auth, staffOnly, controller.getTodayJobs);
router.get('/my', auth, staffOnly, controller.getMyJobs);
router.put('/:id/start', auth, staffOnly, controller.startJob);
router.put('/:id/complete', auth, staffOnly, controller.completeJob);
router.put('/:id/skip', auth, staffOnly, controller.skipJob);
router.post('/:id/photos', auth, staffOnly, controller.uploadPhotos);

module.exports = router;
