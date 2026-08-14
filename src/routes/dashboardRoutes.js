import { Router } from 'express';
import { getWorkspaceSummary } from '../controllers/dashboardController.js';

const router = Router();

router.get('/workspace/:workspaceId/summary', getWorkspaceSummary);

export default router;