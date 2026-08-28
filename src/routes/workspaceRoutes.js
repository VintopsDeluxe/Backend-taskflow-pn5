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


// Workspace Collection & Creation
router.get('/', getWorkspaces);
router.post('/', validate(createWorkspaceSchema), createWorkspace);

// Workspace Item Operations
router.get('/:id', validate(workspaceIdParamSchema), getWorkspaceById);
router.patch('/:id', validate(updateWorkspaceSchema), updateWorkspace);
router.delete('/:id', validate(workspaceIdParamSchema), deleteWorkspace);

// Workspace Member Management
router.get('/:id/members', validate(workspaceIdParamSchema), getWorkspaceMembers);
router.post('/:id/members', validate(addWorkspaceMemberSchema), inviteWorkspaceMember);
router.patch('/:id/members/:userId', validate(updateWorkspaceMemberRoleSchema), updateMemberRole);
router.delete('/:id/members/:userId', validate(workspaceMemberParamSchema), removeWorkspaceMember);

export default router;