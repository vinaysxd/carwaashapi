const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Car wash booking management
 */

/**
 * @swagger
 * /bookings/services:
 *   get:
 *     summary: List available wash services
 *     description: Returns all active wash services with pricing. Public endpoint.
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Full Body Wash
 *                       service_type:
 *                         type: string
 *                         example: full_wash
 *                       regular_price:
 *                         type: number
 *                         example: 499
 *                       subscriber_price:
 *                         type: number
 *                         example: 299
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Internal server error
 */
router.get('/services', controller.getServices);

/**
 * @swagger
 * /bookings/availability:
 *   get:
 *     summary: Check slot availability for a date
 *     description: Returns hourly slot availability for a building on a given date. Public endpoint.
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-06-10"
 *       - in: query
 *         name: building_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Slot availability
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 date:
 *                   type: string
 *                   example: "2026-06-10"
 *                 available:
 *                   type: boolean
 *                   example: true
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       time:
 *                         type: string
 *                         example: "09:00"
 *                       available:
 *                         type: boolean
 *                         example: true
 *                       remaining:
 *                         type: integer
 *                         example: 2
 *       400:
 *         description: Missing or invalid date/building_id
 *       500:
 *         description: Internal server error
 */
router.get('/availability', controller.getAvailability);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     description: Customer-only. Books a time slot for a car wash service.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service_id, vehicle_id, building_id, scheduled_date, scheduled_time]
 *             properties:
 *               service_id:
 *                 type: string
 *                 format: uuid
 *               vehicle_id:
 *                 type: string
 *                 format: uuid
 *               building_id:
 *                 type: string
 *                 format: uuid
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-10"
 *               scheduled_time:
 *                 type: string
 *                 example: "09:00"
 *                 description: Hourly slot between 09:00 and 17:00
 *               notes:
 *                 type: string
 *                 example: Please be gentle with the bumper
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     service:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: Full Body Wash
 *                     scheduled_date:
 *                       type: string
 *                       example: "2026-06-10"
 *                     scheduled_time:
 *                       type: string
 *                       example: "09:00"
 *                     price:
 *                       type: number
 *                       example: 299
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Invalid slot, past date, or service inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — customer role required
 *       409:
 *         description: Time slot fully booked
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, customerOnly, controller.createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get my bookings
 *     description: Customer-only. Returns all bookings for the authenticated customer, newest first.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/my', auth, customerOnly, controller.getMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     description: Customer-only. Returns full details for a single booking owned by the customer.
 *     tags: [Bookings]
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
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, customerOnly, controller.getBookingById);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     description: Customer-only. Cancels a booking if more than 24 hours before the scheduled time.
 *     tags: [Bookings]
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
 *         description: Booking cancelled
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
 *                   example: Booking cancelled successfully
 *       400:
 *         description: Cannot cancel within 24 hours or already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/cancel', auth, customerOnly, controller.cancelBooking);

/**
 * @swagger
 * /bookings/{id}/key-dropped:
 *   put:
 *     summary: Confirm key drop
 *     description: Customer-only. Confirms that the customer has dropped their car keys. Sets booking status to confirmed.
 *     tags: [Bookings]
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
 *         description: Key drop confirmed
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
 *                   example: Key drop confirmed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/key-dropped', auth, customerOnly, controller.confirmKeyDrop);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         service_id:
 *           type: string
 *           format: uuid
 *         vehicle_id:
 *           type: string
 *           format: uuid
 *         building_id:
 *           type: string
 *           format: uuid
 *         scheduled_date:
 *           type: string
 *           format: date
 *           example: "2026-06-10"
 *         scheduled_time:
 *           type: string
 *           example: "09:00"
 *         price:
 *           type: number
 *           example: 299
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           example: pending
 *         key_dropped:
 *           type: boolean
 *           example: false
 *         notes:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 */
