import { Router } from 'express';
import { getCommentsByTask, createComment, deleteComment } from '../controllers/commentController.js';

const router = Router();

router.get('/task/:taskId', getCommentsByTask);
router.post('/', createComment);
router.delete('/:id', deleteComment);

export default router;