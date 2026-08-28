import { Router } from 'express';
import { getUserDashboardSummary, getWorkspaceSummary } from '../controllers/dashboardController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

// Protect all dashboard routes
router.use(authenticateUser);

// Global user summary (bird's-eye view across all user workspaces/tasks)
router.get('/', getUserDashboardSummary);

// Workspace-specific deep-dive summary
router.get('/workspace/:workspaceId/summary', getWorkspaceSummary);

export default router;