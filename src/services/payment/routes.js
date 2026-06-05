const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const customerOnly = roleCheck(['customer']);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay payment processing
 */

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create a Razorpay payment order
 *     description: Customer-only. Creates a Razorpay order for a pending booking. Returns the order details needed to open the Razorpay checkout.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id]
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Razorpay order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: order_PqXEqrXxxx
 *                     amount:
 *                       type: integer
 *                       example: 49900
 *                       description: Amount in paise
 *                     currency:
 *                       type: string
 *                       example: INR
 *                     receipt:
 *                       type: string
 *                       example: booking_abc123
 *       400:
 *         description: Booking not found or already paid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — customer role required
 *       500:
 *         description: Internal server error
 */
router.post('/create-order', auth, customerOnly, controller.createOrder);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify a Razorpay payment
 *     description: >
 *       Verifies the Razorpay payment signature after checkout. For subscription payments,
 *       this activates the subscription — sets status to active, records activated_at (now),
 *       calculates end_date (1 month from activated_at), and generates the QR code UUID.
 *       For booking payments, marks the booking as confirmed.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_PqXEqrXxxx
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_PqXEqrXyyy
 *               razorpay_signature:
 *                 type: string
 *                 example: a1b2c3d4e5f6...
 *               payment_id:
 *                 type: string
 *                 format: uuid
 *                 description: Internal payment record ID returned by POST /payments/create-order
 *     responses:
 *       200:
 *         description: Payment verified. Subscription activated (status=active, activated_at set, end_date set, qr_code generated) or booking confirmed.
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
 *                   example: Payment verified successfully
 *       400:
 *         description: Invalid payment signature
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment record not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify', auth, controller.verifyPayment);

/**
 * @swagger
 * /payments/my:
 *   get:
 *     summary: Get my payment history
 *     description: Customer-only. Returns all payments made by the authenticated customer.
 *     tags: [Payments]
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
 *         description: Paginated payment history
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       booking_id:
 *                         type: string
 *                         format: uuid
 *                       razorpay_order_id:
 *                         type: string
 *                       razorpay_payment_id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         example: 499
 *                       status:
 *                         type: string
 *                         enum: [pending, paid, failed]
 *                         example: paid
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/my', auth, customerOnly, controller.getMyPayments);

module.exports = router;
