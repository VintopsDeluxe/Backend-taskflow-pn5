import { Router } from 'express';
import {
  getProjectsByWorkspace,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

// Apply authentication middleware across all project endpoints
router.use(authenticateUser);

router.get('/workspace/:workspaceId', getProjectsByWorkspace);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;