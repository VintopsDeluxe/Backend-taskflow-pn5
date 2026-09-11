import { Router } from 'express';
import { 
  inviteWorkspaceMember, 
  acceptWorkspaceInvitation, 
  updateMemberRole, 
  removeWorkspaceMember 
} from '../controllers/workspaceMemberController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { verifyWorkspaceRole } from '../middlewares/workspaceAuth.js';

const router = Router();

// All routes require user authentication
router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/workspace-members/{workspaceId}/invitations:
 *   post:
 *     summary: Invite a new member to a workspace (Admin/Owner only)
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *                 enum: [owner, admin, member]
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Owner access required)
 */
router.post('/:workspaceId/invitations', verifyWorkspaceRole(['owner', 'admin']), inviteWorkspaceMember);

/**
 * @swagger
 * /api/v1/workspace-members/invitations/accept:
 *   post:
 *     summary: Accept a workspace invitation using an invite token
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *       400:
 *         description: Invalid or expired token
 *       401:
 *         description: Unauthorized
 */
router.post('/invitations/accept', acceptWorkspaceInvitation);

/**
 * @swagger
 * /api/v1/workspace-members/{workspaceId}/members/{memberId}:
 *   patch:
 *     summary: Update a workspace member's role (Admin/Owner only)
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The member ID
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
 *                 enum: [owner, admin, member]
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Owner access required)
 *       404:
 *         description: Member not found
 */
router.patch('/:workspaceId/members/:memberId', verifyWorkspaceRole(['owner', 'admin']), updateMemberRole);

/**
 * @swagger
 * /api/v1/workspace-members/{workspaceId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a workspace (Admin/Owner only)
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The workspace ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The member ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Owner access required)
 *       404:
 *         description: Member not found
 */
router.delete('/:workspaceId/members/:memberId', verifyWorkspaceRole(['owner', 'admin']), removeWorkspaceMember);

export default router;