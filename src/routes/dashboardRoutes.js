import { Router } from 'express';
import { getUserDashboardSummary, getWorkspaceSummary } from '../controllers/dashboardController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

// Protect all dashboard routes
router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get global user dashboard summary across all workspaces and tasks
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserDashboardSummary);

/**
 * @swagger
 * /api/v1/dashboard/workspace/{workspaceId}/summary:
 *   get:
 *     summary: Get workspace-specific deep-dive summary
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: Workspace summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/workspace/:workspaceId/summary', getWorkspaceSummary);

export default router;