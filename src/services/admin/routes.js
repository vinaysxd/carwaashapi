const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const adminOnly = roleCheck(['admin', 'superadmin']);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and management (admin/superadmin only)
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get today's dashboard stats
 *     description: Admin-only. Returns aggregated stats for the admin's building for today — job counts, booking counts, active subscribers, and revenue.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_jobs_today:
 *                       type: integer
 *                       example: 12
 *                     completed_jobs_today:
 *                       type: integer
 *                       example: 8
 *                     pending_jobs_today:
 *                       type: integer
 *                       example: 4
 *                     total_subscribers:
 *                       type: integer
 *                       example: 47
 *                     total_bookings_today:
 *                       type: integer
 *                       example: 10
 *                     revenue_today:
 *                       type: number
 *                       example: 3980
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Admin profile not found
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', auth, adminOnly, controller.getDashboard);

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Get all jobs for admin's building
 *     description: Admin-only. Returns paginated jobs with optional status and date filters. Includes vehicle and customer details.
 *     tags: [Admin]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, skipped]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-06-10"
 *     responses:
 *       200:
 *         description: Paginated job list
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Job'
 *                       - type: object
 *                         properties:
 *                           customer_name:
 *                             type: string
 *                             example: Rahul Sharma
 *                           vehicles:
 *                             type: object
 *                             properties:
 *                               make:
 *                                 type: string
 *                               model:
 *                                 type: string
 *                               plate_number:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/jobs', auth, adminOnly, controller.getJobs);

/**
 * @swagger
 * /admin/jobs/{id}/reassign:
 *   put:
 *     summary: Reassign a job to a different staff member
 *     description: Admin-only. Changes the assigned staff for a job. The new staff member must belong to the same building.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [staff_id]
 *             properties:
 *               staff_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Job reassigned
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
 *                   example: Job reassigned
 *       400:
 *         description: Missing staff_id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job or staff not found in this building
 *       500:
 *         description: Internal server error
 */
router.put('/jobs/:id/reassign', auth, adminOnly, controller.reassignJob);

/**
 * @swagger
 * /admin/subscribers:
 *   get:
 *     summary: Get active subscribers for admin's building
 *     description: Admin-only. Returns paginated list of active subscriptions including customer name and vehicle details.
 *     tags: [Admin]
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
 *         description: Paginated subscriber list
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Subscription'
 *                       - type: object
 *                         properties:
 *                           customer_name:
 *                             type: string
 *                             example: Rahul Sharma
 *                           vehicles:
 *                             type: object
 *                             properties:
 *                               make:
 *                                 type: string
 *                               model:
 *                                 type: string
 *                               plate_number:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/subscribers', auth, adminOnly, controller.getSubscribers);

/**
 * @swagger
 * /admin/coupons:
 *   post:
 *     summary: Create a coupon
 *     description: Admin-only. Creates a discount coupon for the admin's building.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discount_type, discount_value, expiry_date]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SUMMER20
 *                 description: Uppercase coupon code (auto-uppercased)
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, flat]
 *                 example: percentage
 *               discount_value:
 *                 type: number
 *                 example: 20
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-31"
 *               max_uses:
 *                 type: integer
 *                 example: 100
 *                 description: Maximum redemptions. Omit for unlimited.
 *     responses:
 *       201:
 *         description: Coupon created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 coupon:
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Coupon code already exists for this building
 *       500:
 *         description: Internal server error
 */
router.post('/coupons', auth, adminOnly, controller.createCoupon);

/**
 * @swagger
 * /admin/coupons:
 *   get:
 *     summary: Get all coupons for admin's building
 *     description: Admin-only. Returns all coupons (active and inactive), newest first.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 coupons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/coupons', auth, adminOnly, controller.getCoupons);

/**
 * @swagger
 * /admin/coupons/{id}/deactivate:
 *   put:
 *     summary: Deactivate a coupon
 *     description: Admin-only. Sets is_active to false, preventing further use of the coupon.
 *     tags: [Admin]
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
 *         description: Coupon deactivated
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
 *                   example: Coupon deactivated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Coupon not found
 *       500:
 *         description: Internal server error
 */
router.put('/coupons/:id/deactivate', auth, adminOnly, controller.deactivateCoupon);

/**
 * @swagger
 * /admin/blocked-dates:
 *   post:
 *     summary: Block a date for the building
 *     description: Admin-only. Marks a date as unavailable for bookings. Can optionally cancel all existing bookings for that date and notify customers.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-15"
 *               reason:
 *                 type: string
 *                 example: Building maintenance day
 *               notify_customers:
 *                 type: boolean
 *                 example: true
 *                 description: If true, cancels and notifies all affected customers
 *               cancellation_reason:
 *                 type: string
 *                 example: Service unavailable due to building maintenance on this day
 *     responses:
 *       201:
 *         description: Date blocked
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
 *                   example: Date blocked
 *                 affected_bookings:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Missing date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/blocked-dates', auth, adminOnly, controller.blockDate);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics for a date range
 *     description: Admin-only. Returns revenue, job counts, subscriber count, and service breakdown for the given date range.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-06-01"
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-06-30"
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     total_revenue:
 *                       type: number
 *                       example: 48750
 *                     total_jobs:
 *                       type: integer
 *                       example: 210
 *                     completed_jobs:
 *                       type: integer
 *                       example: 195
 *                     total_subscribers:
 *                       type: integer
 *                       example: 47
 *                     top_services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_type:
 *                             type: string
 *                             example: full_wash
 *                           count:
 *                             type: integer
 *                             example: 130
 *       400:
 *         description: Missing start_date or end_date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', auth, adminOnly, controller.getAnalytics);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           example: SUMMER20
 *         discount_type:
 *           type: string
 *           enum: [percentage, flat]
 *           example: percentage
 *         discount_value:
 *           type: number
 *           example: 20
 *         expiry_date:
 *           type: string
 *           format: date
 *           example: "2026-07-31"
 *         max_uses:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         building_id:
 *           type: string
 *           format: uuid
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 */
