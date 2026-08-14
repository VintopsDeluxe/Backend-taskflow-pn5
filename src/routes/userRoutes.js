import { Router } from 'express';
import {
  getCurrentUserProfile,
  updateUserProfile,
  getUserNotifications,
  markNotificationAsRead,
  getUserPreferences,
  updateUserPreferences,
} from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/auth.js'; 
import { validate } from '../middlewares/validate.js';
import {
  updateProfileSchema,
  updatePreferencesSchema,
} from '../schemas/userSchema.js';

const router = Router();

// Protect all routes below this line
router.use(authenticateUser);

router.get('/me', getCurrentUserProfile);
router.put('/me', validate(updateProfileSchema), updateUserProfile);
router.get('/notifications', getUserNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);

// Notification Preferences Routes
router.get('/preferences', getUserPreferences);
router.put('/preferences', validate(updatePreferencesSchema), updateUserPreferences);

export default router;