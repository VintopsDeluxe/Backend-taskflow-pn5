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

/**
 * @swagger
 * /api/v1/projects/workspace/{workspaceId}:
 *   get:
 *     summary: Fetch all projects for a specific workspace
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/workspace/:workspaceId', getProjectsByWorkspace);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workspaceId
 *             properties:
 *               name:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Bad request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/', createProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update an existing project by its ID
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.put('/:id', updateProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete a project by its ID
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.delete('/:id', deleteProject);

export default router;