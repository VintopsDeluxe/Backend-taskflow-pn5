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

// Invite a user (Requires Admin or Owner role in target workspace)
router.post('/:workspaceId/invitations', verifyWorkspaceRole(['owner', 'admin']), inviteWorkspaceMember);

// Accept an invite (Any authenticated user with the token)
router.post('/invitations/accept', acceptWorkspaceInvitation);

// Update a member's role (Requires Owner or Admin role)
router.patch('/:workspaceId/members/:memberId', verifyWorkspaceRole(['owner', 'admin']), updateMemberRole);

// Remove a member (Requires Owner or Admin role)
router.delete('/:workspaceId/members/:memberId', verifyWorkspaceRole(['owner', 'admin']), removeWorkspaceMember);

export default router;