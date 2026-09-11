import { Router } from 'express';
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadAvatar,
  changePassword,
  deactivateAccount,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUserPreferences,
  updateUserPreferences,
} from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/auth.js'; 
import { validate } from '../middlewares/validate.js';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
} from '../schemas/userSchema.js';

const router = Router();

// Protect all routes
router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Fetch current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getCurrentUserProfile);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/me', validate(updateProfileSchema), updateUserProfile);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   post:
 *     summary: Upload or update current user avatar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/me/avatar', uploadAvatar);

/**
 * @swagger
 * /api/v1/users/me/change-password:
 *   patch:
 *     summary: Change password for current authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 */
router.patch('/me/change-password', validate(changePasswordSchema), changePassword);

/**
 * @swagger
 * /api/v1/users/me/deactivate:
 *   patch:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/me/deactivate', deactivateAccount);

/**
 * @swagger
 * /api/v1/users/notifications:
 *   get:
 *     summary: Fetch all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', getUserNotifications);

/**
 * @swagger
 * /api/v1/users/notifications/read-all:
 *   patch:
 *     summary: Mark all user notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch('/notifications/read-all', markAllNotificationsAsRead);

/**
 * @swagger
 * /api/v1/users/notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch('/notifications/:id/read', markNotificationAsRead);

/**
 * @swagger
 * /api/v1/users/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete('/notifications/:id', deleteNotification);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   get:
 *     summary: Fetch current user preferences
 *     tags: [Preferences]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', getUserPreferences);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     summary: Update current user preferences
 *     tags: [Preferences]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *               emailNotifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/preferences', validate(updatePreferencesSchema), updateUserPreferences);

export default router;