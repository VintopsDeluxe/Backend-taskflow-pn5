import { Router } from 'express';
import {
  getCommentsByTask,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js'; // Your auth middleware that populates req.user

const router = Router();

// Public / Authenticated read route
// GET /api/comments/task/:taskId
router.get('/task/:taskId', getCommentsByTask);

// Protected routes (require user authentication)
router.use(protect);

// POST /api/comments
router.post('/', createComment);

// DELETE /api/comments/:id
router.delete('/:id', deleteComment);

export default router;