const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');
const controller = require('./controller');

const staffOnly = roleCheck(['staff']);

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management for staff members
 */

/**
 * @swagger
 * /jobs/my-today:
 *   get:
 *     summary: Get today's assigned jobs
 *     description: Staff-only. Returns all jobs assigned to the authenticated staff member for today.
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Today's job list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — staff role required
 *       500:
 *         description: Internal server error
 */
router.get('/my-today', auth, staffOnly, controller.getTodayJobs);

/**
 * @swagger
 * /jobs/my:
 *   get:
 *     summary: Get all my jobs
 *     description: Staff-only. Returns all jobs ever assigned to the authenticated staff member, with pagination.
 *     tags: [Jobs]
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
 *     responses:
 *       200:
 *         description: Paginated job history
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
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/my', auth, staffOnly, controller.getMyJobs);

/**
 * @swagger
 * /jobs/{id}/start:
 *   put:
 *     summary: Start a job
 *     description: Staff-only. Marks a job as in_progress and records start time.
 *     tags: [Jobs]
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
 *         description: Job started
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
 *                   example: Job started
 *       400:
 *         description: Job cannot be started (wrong status or not assigned to this staff)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/start', auth, staffOnly, controller.startJob);

/**
 * @swagger
 * /jobs/{id}/complete:
 *   put:
 *     summary: Complete a job
 *     description: Staff-only. Marks a job as completed and notifies the customer.
 *     tags: [Jobs]
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
 *         description: Job completed
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
 *                   example: Job completed successfully
 *       400:
 *         description: Job is not in progress
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/complete', auth, staffOnly, controller.completeJob);

/**
 * @swagger
 * /jobs/{id}/skip:
 *   put:
 *     summary: Skip a job
 *     description: Staff-only. Marks a job as skipped with an optional reason (e.g. car not present).
 *     tags: [Jobs]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Car not present in parking
 *     responses:
 *       200:
 *         description: Job skipped
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
 *                   example: Job skipped
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/skip', auth, staffOnly, controller.skipJob);

/**
 * @swagger
 * /jobs/{id}/photos:
 *   post:
 *     summary: Upload before/after job photos
 *     description: Staff-only. Attaches photo URLs to a completed or in-progress job.
 *     tags: [Jobs]
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
 *             required: [photos]
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                   example: https://storage.example.com/job-photos/abc123.jpg
 *     responses:
 *       201:
 *         description: Photos uploaded
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
 *                   example: Photos uploaded successfully
 *       400:
 *         description: No photos provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/photos', auth, staffOnly, controller.uploadPhotos);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         booking_id:
 *           type: string
 *           format: uuid
 *         staff_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         building_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, skipped]
 *           example: assigned
 *         scheduled_date:
 *           type: string
 *           format: date
 *           example: "2026-06-10"
 *         notes:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 */
