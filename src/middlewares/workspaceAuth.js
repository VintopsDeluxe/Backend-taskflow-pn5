import { supabaseAdmin } from '../config/supabase.js';

export const verifyWorkspaceRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const workspaceId = req.params.workspaceId || req.body.workspace_id;

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID is required.' });
      }

      // Use supabaseAdmin to query workspace_members safely on the backend
      const { data: member, error } = await supabaseAdmin
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (error || !member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You do not have the required permissions for this workspace.' 
        });
      }

      req.workspaceRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};