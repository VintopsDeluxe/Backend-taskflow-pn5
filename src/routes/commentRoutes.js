import { Router } from 'express';
import {
  getCommentsByTask,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/v1/comments/task/{taskId}:
 *   get:
 *     summary: Fetch all comments for a specific task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Task not found
 */
router.get('/task/:taskId', getCommentsByTask);

// Protected routes (require user authentication)
router.use(protect);

/**
 * @swagger
 * /api/v1/comments:
 *   post:
 *     summary: Create a new comment on a task
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - content
 *             properties:
 *               taskId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/', createComment);

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     summary: Delete a comment by its ID
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', deleteComment);

export default router;