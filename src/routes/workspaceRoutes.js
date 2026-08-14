import express from 'express';
import { 
  getWorkspaces, 
  createWorkspace 
} from '../controllers/workspaceController.js'; // Adjust controller import if needed

const router = express.Router();

router.get('/', getWorkspaces);
router.post('/', createWorkspace);

export default router;