const router = require('express').Router();
const controller = require('./controller');
const { authLimiter, otpLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const v = require('./validation');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to a phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number]
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *                 description: 10-digit mobile number
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 *       429:
 *         description: Too many OTP requests
 */
router.post('/send-otp', otpLimiter, validate(v.sendOtp), controller.sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and receive access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, otp]
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "482910"
 *                 description: 6-digit OTP
 *     responses:
 *       200:
 *         description: OTP verified, tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 *       429:
 *         description: Too many authentication attempts
 */
router.post('/verify-otp', authLimiter, validate(v.verifyOtp), controller.verifyOtp);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Exchange a refresh token for a new access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', validate(v.refreshToken), controller.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 *       400:
 *         description: Missing refresh token
 */
router.post('/logout', validate(v.logout), controller.logout);

module.exports = router;
