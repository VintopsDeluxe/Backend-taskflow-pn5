import express from 'express';
import { 
  getWorkspaces, 
  getWorkspaceById, 
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember
} from '../controllers/workspaceController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { 
  createWorkspaceSchema, 
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
  workspaceIdParamSchema,
  workspaceMemberParamSchema
} from '../schemas/userSchema.js';

const router = express.Router();

// Apply authentication middleware across all workspace endpoints
router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/workspaces:
 *   get:
 *     summary: Fetch all workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getWorkspaces);

/**
 * @swagger
 * /api/v1/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Bad request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createWorkspaceSchema), createWorkspace);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   get:
 *     summary: Fetch a specific workspace by its ID
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/:id', validate(workspaceIdParamSchema), getWorkspaceById);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   patch:
 *     summary: Update an existing workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
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
 *         description: Workspace updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.patch('/:id', validate(updateWorkspaceSchema), updateWorkspace);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   delete:
 *     summary: Delete a workspace by its ID
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.delete('/:id', validate(workspaceIdParamSchema), deleteWorkspace);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members:
 *   get:
 *     summary: Fetch all members of a specific workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: Workspace members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get('/:id/members', validate(workspaceIdParamSchema), getWorkspaceMembers);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members:
 *   post:
 *     summary: Invite or add a new member to a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member invited successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.post('/:id/members', validate(addWorkspaceMemberSchema), inviteWorkspaceMember);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members/{userId}:
 *   patch:
 *     summary: Update a workspace member's role
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or member not found
 */
router.patch('/:id/members/:userId', validate(updateWorkspaceMemberRoleSchema), updateMemberRole);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or member not found
 */
router.delete('/:id/members/:userId', validate(workspaceMemberParamSchema), removeWorkspaceMember);

export default router;