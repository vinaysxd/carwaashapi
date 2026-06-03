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
 *   name: Buildings
 *   description: Residential building management
 */

/**
 * @swagger
 * /buildings:
 *   post:
 *     summary: Create a new building
 *     description: Admin-only. Registers a new residential building in the system.
 *     tags: [Buildings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Prestige Lakeside Habitat
 *               address:
 *                 type: string
 *                 example: Whitefield, Bangalore
 *               city:
 *                 type: string
 *                 example: Bangalore
 *               pincode:
 *                 type: string
 *                 example: "560066"
 *     responses:
 *       201:
 *         description: Building created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 building:
 *                   $ref: '#/components/schemas/Building'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, adminOnly, validate(v.createBuilding), controller.createBuilding);

/**
 * @swagger
 * /buildings:
 *   get:
 *     summary: List all buildings
 *     description: Returns all active buildings. Public endpoint.
 *     tags: [Buildings]
 *     responses:
 *       200:
 *         description: List of buildings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 buildings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Building'
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.getBuildings);

/**
 * @swagger
 * /buildings/{id}:
 *   get:
 *     summary: Get a building by ID
 *     description: Returns a single building. Public endpoint.
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 *     responses:
 *       200:
 *         description: Building details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 building:
 *                   $ref: '#/components/schemas/Building'
 *       404:
 *         description: Building not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.getBuildingById);

/**
 * @swagger
 * /buildings/{id}:
 *   put:
 *     summary: Update a building
 *     description: Admin-only. Updates building details.
 *     tags: [Buildings]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Prestige Lakeside Habitat
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Building updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 building:
 *                   $ref: '#/components/schemas/Building'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Building not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth, adminOnly, validate(v.updateBuilding), controller.updateBuilding);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Building:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Prestige Lakeside Habitat
 *         address:
 *           type: string
 *           example: Whitefield, Bangalore
 *         city:
 *           type: string
 *           example: Bangalore
 *         pincode:
 *           type: string
 *           example: "560066"
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 */
