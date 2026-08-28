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

router.post('/', validate(createTaskSchema), createTask);
router.post('/bulk-update', validate(bulkUpdateTasksSchema), bulkUpdateTasks);

router.get('/project/:projectId', validate(projectTasksParamSchema), validate(paginationQuerySchema), getTasksByProject);

router.get('/:taskId', validate(taskIdParamSchema), getTaskById);
router.patch('/:taskId', validate(updateTaskSchema), updateTask);
router.patch('/:taskId/status', validate(updateTaskStatusSchema), updateTaskStatus);
router.post('/:taskId/duplicate', validate(taskIdParamSchema), duplicateTask);
router.delete('/:taskId', validate(taskIdParamSchema), deleteTask);

export default router;