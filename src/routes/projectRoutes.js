import { Router } from 'express';
import {
  getProjectsByWorkspace,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

const router = Router();

router.get('/workspace/:workspaceId', getProjectsByWorkspace);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;