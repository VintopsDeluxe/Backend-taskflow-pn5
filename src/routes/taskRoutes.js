import express from 'express';
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  duplicateTask,
  deleteTask,
  bulkUpdateTasks,
} from '../controllers/taskController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  bulkUpdateTasksSchema,
  paginationQuerySchema,
  taskIdParamSchema,
  projectTasksParamSchema,
} from '../schemas/taskSchema.js';

const router = express.Router();

router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *               projectId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/v1/tasks/bulk-update:
 *   post:
 *     summary: Perform bulk updates on multiple tasks
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updates:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tasks updated successfully in bulk
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk-update', validate(bulkUpdateTasksSchema), bulkUpdateTasks);

/**
 * @swagger
 * /api/v1/tasks/project/{projectId}:
 *   get:
 *     summary: Fetch all tasks for a specific project with pagination
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/project/:projectId', validate(projectTasksParamSchema), validate(paginationQuerySchema), getTasksByProject);

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   get:
 *     summary: Fetch a specific task by its ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/:taskId', validate(taskIdParamSchema), getTaskById);

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   patch:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.patch('/:taskId', validate(updateTaskSchema), updateTask);

/**
 * @swagger
 * /api/v1/tasks/{taskId}/status:
 *   patch:
 *     summary: Update status of a specific task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.patch('/:taskId/status', validate(updateTaskStatusSchema), updateTaskStatus);

/**
 * @swagger
 * /api/v1/tasks/{taskId}/duplicate:
 *   post:
 *     summary: Duplicate an existing task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       201:
 *         description: Task duplicated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.post('/:taskId/duplicate', validate(taskIdParamSchema), duplicateTask);

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by its ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.delete('/:taskId', validate(taskIdParamSchema), deleteTask);

export default router;