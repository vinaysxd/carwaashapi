const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const customerOnly = roleCheck(['customer']);

/**
 * @swagger
 * tags:
 *   name: Presence
 *   description: Customer building presence tracking
 */

/**
 * @swagger
 * /presence/checkin:
 *   post:
 *     summary: Check in to a building
 *     description: Customer-only. Records the customer's arrival at their building for the day.
 *     tags: [Presence]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [building_id]
 *             properties:
 *               building_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Checked in successfully
 *                 presence:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     building_id:
 *                       type: string
 *                       format: uuid
 *                     check_in_time:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Already checked in today
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — customer role required
 *       500:
 *         description: Internal server error
 */
router.post('/checkin', auth, customerOnly, validate(v.checkIn), controller.checkIn);

/**
 * @swagger
 * /presence/checkout:
 *   post:
 *     summary: Check out from a building
 *     description: Customer-only. Records the customer's departure from the building.
 *     tags: [Presence]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Checked out successfully
 *       400:
 *         description: No active check-in found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/checkout', auth, customerOnly, controller.checkOut);

/**
 * @swagger
 * /presence/today:
 *   get:
 *     summary: Get today's presence status
 *     description: Customer-only. Returns the customer's check-in/check-out status for today.
 *     tags: [Presence]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Today's presence record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 presence:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     building_id:
 *                       type: string
 *                       format: uuid
 *                     check_in_time:
 *                       type: string
 *                       format: date-time
 *                     check_out_time:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                 checked_in:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/today', auth, customerOnly, controller.getTodayPresence);

module.exports = router;
