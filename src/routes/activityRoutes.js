import { Router } from 'express';
import {
  getProjectActivity,
  getWorkspaceActivity,
} from '../controllers/activityController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { paginationQuerySchema } from '../schemas/taskSchema.js';

const router = Router();

// Protect all activity routes
router.use(authenticateUser);

// GET /api/v1/activity-logs/project/:projectId
router.get(
  '/project/:projectId',
  validate(paginationQuerySchema),
  getProjectActivity
);

// GET /api/v1/activity-logs/workspace/:workspaceId
router.get(
  '/workspace/:workspaceId',
  validate(paginationQuerySchema),
  getWorkspaceActivity
);

export default router;