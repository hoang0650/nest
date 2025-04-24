var express = require('express');
var router = express.Router();
const { 
    getUserInfo, 
    createUser, 
    login, 
    createBusinessUser, 
    getUsersByRole, 
    updateUser, 
    toggleUserBlock,
    changePassword
} = require('../controllers/users');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the new user
 *               password:
 *                 type: string
 *                 description: Password for the new user
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email address
 *                 username:
 *                   type: string
 *                   description: Username
 *       500:
 *         description: Internal server error
 */

router.post('/signup', createUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Login success message
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *       400:
 *         description: Invalid credentials or password
 *       401:
 *         description: Unauthorized, user not found
 *       500:
 *         description: Internal server error
 */

router.post('/login', login);
/**
 * @swagger
 * /users/info:
 *   get:
 *     summary: Get user information based on JWT token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: Username
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email address
 *                 blocked:
 *                   type: boolean
 *                   description: User's block status
 *                 role:
 *                   type: string
 *                   description: User's role
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */

router.get('/info', getUserInfo);

/**
 * @swagger
 * /users/business/signup:
 *   post:
 *     summary: Register a new business user with business information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new business user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the new business user
 *               password:
 *                 type: string
 *                 description: Password for the new business user
 *               businessInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Business name
 *                   address:
 *                     type: string
 *                     description: Business address
 *                   tax_code:
 *                     type: number
 *                     description: Business tax code
 *                   contact:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                         description: Business contact phone number
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Business contact email
 *             required:
 *               - username
 *               - email
 *               - password
 *               - businessInfo
 *     responses:
 *       201:
 *         description: Business user successfully registered
 *       400:
 *         description: Email already in use or invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/business/signup', createBusinessUser);

/**
 * @swagger
 * /users/role/{role}:
 *   get:
 *     summary: Get users by role
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, business, hotel, staff, customer]
 *         description: The role to filter users by
 *     responses:
 *       200:
 *         description: List of users with the specified role
 *       400:
 *         description: Invalid role provided
 *       500:
 *         description: Internal server error
 */
router.get('/role/:role', getUsersByRole);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user information
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:userId', updateUser);

/**
 * @swagger
 * /users/{userId}/block:
 *   put:
 *     summary: Block or unblock a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blocked:
 *                 type: boolean
 *                 description: True to block, false to unblock
 *             required:
 *               - blocked
 *     responses:
 *       200:
 *         description: User block status updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:userId/block', toggleUserBlock);

/**
 * @swagger
 * /users/{userId}/change-password:
 *   put:
 *     summary: Change user password
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 description: User's new password
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect or new password invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:userId/change-password', changePassword);

module.exports = router;
