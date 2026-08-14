import express from 'express';
import { 
  getTasksByProject, 
  createTask, 
  updateTaskStatus 
} from '../controllers/taskController.js'; // Adjust controller import if needed

const router = express.Router();

router.get('/project/:projectId', getTasksByProject);
router.post('/', createTask);
router.patch('/:taskId/status', updateTaskStatus);

export default router;