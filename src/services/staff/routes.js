const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const validate = require('../../middleware/validate');
const controller = require('./controller');
const v = require('./validation');

const adminOnly = roleCheck(['admin', 'superadmin']);

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management (admin only)
 */

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a staff member
 *     description: Admin-only. Registers a new staff member under the admin's building.
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, name, building_id]
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               name:
 *                 type: string
 *                 example: Raju Kumar
 *               building_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Staff member created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Validation error or staff already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, adminOnly, validate(v.createStaff), controller.createStaff);

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Get all staff for the admin's building
 *     description: Admin-only. Returns all staff members with optional pagination.
 *     tags: [Staff]
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
 *         description: Paginated list of staff
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
 *                     $ref: '#/components/schemas/Staff'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, adminOnly, controller.getAllStaff);

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Get a staff member by ID
 *     description: Admin-only. Returns full details for a single staff member.
 *     tags: [Staff]
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
 *         description: Staff member details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, adminOnly, controller.getStaffById);

/**
 * @swagger
 * /staff/{id}/approve:
 *   put:
 *     summary: Approve a staff member
 *     description: Admin-only. Sets the staff member status to active/approved.
 *     tags: [Staff]
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
 *         description: Staff member approved
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
 *                   example: Staff approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/approve', auth, adminOnly, controller.approveStaff);

/**
 * @swagger
 * /staff/{id}/deactivate:
 *   put:
 *     summary: Deactivate a staff member
 *     description: Admin-only. Prevents the staff member from logging in or receiving jobs.
 *     tags: [Staff]
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
 *         description: Staff member deactivated
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
 *                   example: Staff deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/deactivate', auth, adminOnly, controller.deactivateStaff);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         building_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Raju Kumar
 *         phone_number:
 *           type: string
 *           example: "9876543210"
 *         is_active:
 *           type: boolean
 *           example: true
 *         is_approved:
 *           type: boolean
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 */
