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

// Profile Routes (F-016)
router.get('/me', getCurrentUserProfile);
router.put('/me', validate(updateProfileSchema), updateUserProfile);
router.post('/me/avatar', uploadAvatar);
router.patch('/me/change-password', validate(changePasswordSchema), changePassword);
router.patch('/me/deactivate', deactivateAccount);

// Notifications Routes (F-013)
router.get('/notifications', getUserNotifications);
router.patch('/notifications/read-all', markAllNotificationsAsRead);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.delete('/notifications/:id', deleteNotification);

// Notification Preferences Routes (F-013, F-016)
router.get('/preferences', getUserPreferences);
router.put('/preferences', validate(updatePreferencesSchema), updateUserPreferences);

export default router;