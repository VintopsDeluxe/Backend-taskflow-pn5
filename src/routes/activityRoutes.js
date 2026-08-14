import { Router } from 'express';
import { getProjectActivity } from '../controllers/activityController.js';
import { protect } from '../middlewares/auth.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

// GET /api/v1/projects/:projectId/activity
router.get('/projects/:projectId/activity', getProjectActivity);

export default router;