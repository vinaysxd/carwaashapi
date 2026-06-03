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
 *   name: Subscriptions
 *   description: Subscription plan management
 */

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: List available subscription plans
 *     description: Returns all active subscription plans. Public endpoint.
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Monthly Plan
 *                       duration_days:
 *                         type: integer
 *                         example: 30
 *                       price:
 *                         type: number
 *                         example: 1499
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Internal server error
 */
router.get('/plans', controller.getPlans);

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create a subscription
 *     description: Customer-only. Subscribes to a plan for a specific building and vehicle.
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id, vehicle_id, building_id]
 *             properties:
 *               plan_id:
 *                 type: string
 *                 format: uuid
 *               vehicle_id:
 *                 type: string
 *                 format: uuid
 *               building_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Subscription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Validation error or active subscription already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — customer role required
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, customerOnly, validate(v.createSubscription), controller.createSubscription);

/**
 * @swagger
 * /subscriptions/my:
 *   get:
 *     summary: Get my active subscription
 *     description: Customer-only. Returns the customer's current active subscription.
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No active subscription found
 *       500:
 *         description: Internal server error
 */
router.get('/my', auth, customerOnly, controller.getMySubscription);

/**
 * @swagger
 * /subscriptions/{id}/pause:
 *   put:
 *     summary: Pause a subscription
 *     description: Customer-only. Temporarily pauses an active subscription.
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription paused
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
 *                   example: Subscription paused
 *       400:
 *         description: Subscription cannot be paused
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/pause', auth, customerOnly, controller.pauseSubscription);

/**
 * @swagger
 * /subscriptions/{id}/cancel:
 *   put:
 *     summary: Cancel a subscription
 *     description: Customer-only. Cancels an active or paused subscription.
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription cancelled
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
 *                   example: Subscription cancelled
 *       400:
 *         description: Subscription already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/cancel', auth, customerOnly, controller.cancelSubscription);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         plan_id:
 *           type: string
 *           format: uuid
 *         vehicle_id:
 *           type: string
 *           format: uuid
 *         building_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [active, paused, cancelled]
 *           example: active
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2026-06-01"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2026-07-01"
 *         created_at:
 *           type: string
 *           format: date-time
 */
