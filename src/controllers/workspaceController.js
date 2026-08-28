import { getSupabaseClient } from '../config/supabase.js';
import { appEvents } from '../events/eventEmitter.js';

// GET /api/v1/workspaces
export const getWorkspaces = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in session.'
      });
    }

    const supabaseUser = getSupabaseClient(req);

    // Fetch workspaces where user is either the owner OR a workspace member
    const { data, error } = await supabaseUser
      .from('workspaces')
      .select(`
        *,
        workspace_members!inner(role)
      `)
      .eq('workspace_members.user_id', userId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/workspaces/:id
export const getWorkspaceById = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in session.'
      });
    }

    const { id } = req.params;
    const supabaseUser = getSupabaseClient(req);

    // 1. Fetch workspace alone without the relation join
    const { data: workspace, error } = await supabaseUser
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Workspace not found'
        });
      }
      throw error;
    }

    // 2. Fetch owner details separately from the users table
    let ownerData = null;
    if (workspace.owner_id) {
      const { data: owner } = await supabaseUser
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('id', workspace.owner_id)
        .maybeSingle();
      ownerData = owner;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...workspace,
        owner: ownerData
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/workspaces
export const createWorkspace = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in session.'
      });
    }

    const { name, description } = req.body;
    const supabaseUser = getSupabaseClient(req);

    // 1. Insert Workspace
    const { data: workspace, error: workspaceError } = await supabaseUser
      .from('workspaces')
      .insert([
        {
          name,
          description,
          owner_id: userId
        }
      ])
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    // 2. Automatically assign owner as 'admin' in workspace_members
    const { error: memberError } = await supabaseUser
      .from('workspace_members')
      .insert([
        {
          workspace_id: workspace.id,
          user_id: userId,
          role: 'owner'
        }
      ]);

    if (memberError) throw memberError;

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: workspace
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/workspaces/:id
export const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const supabaseUser = getSupabaseClient(req);

    const updates = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      updated_at: new Date().toISOString()
    };

    const { data: workspace, error } = await supabaseUser
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      data: workspace
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/workspaces/:id
export const deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabaseUser = getSupabaseClient(req);

    const { error } = await supabaseUser
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/workspaces/:id/members
export const getWorkspaceMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabaseUser = getSupabaseClient(req);

    const { data, error } = await supabaseUser
      .from('workspace_members')
      .select(`
        id,
        role,
        created_at,
        user:user_id(id, full_name, email, avatar_url)
      `)
      .eq('workspace_id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/workspaces/:id/invitations
export const inviteWorkspaceMember = async (req, res, next) => {
  try {
    const { id: workspaceId } = req.params;
    const { email, role = 'team_member' } = req.body;
    const supabaseUser = getSupabaseClient(req);

    // 1. Find target user by email
    const { data: targetUser, error: userError } = await supabaseUser
      .from('users')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (userError || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User with this email was not found'
      });
    }

    // 2. Add user to workspace members
    const { data: member, error: insertError } = await supabaseUser
      .from('workspace_members')
      .insert([
        {
          workspace_id: workspaceId,
          user_id: targetUser.id,
          role
        }
      ])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this workspace'
        });
      }
      throw insertError;
    }

    // 3. Emit notification event
    appEvents.emit('workspace.member_invited', {
      workspaceId,
      invitedUserId: targetUser.id,
      invitedBy: req.user.id,
      role
    });

    return res.status(201).json({
      success: true,
      message: 'Member added to workspace successfully',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/workspaces/:id/members/:userId
export const updateMemberRole = async (req, res, next) => {
  try {
    const { id: workspaceId, userId } = req.params;
    const { role } = req.body;
    const supabaseUser = getSupabaseClient(req);

    if (!['admin', 'project_manager', 'team_member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const { data, error } = await supabaseUser
      .from('workspace_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/workspaces/:id/members/:userId
export const removeWorkspaceMember = async (req, res, next) => {
  try {
    const { id: workspaceId, userId } = req.params;
    const supabaseUser = getSupabaseClient(req);

    const { error } = await supabaseUser
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Member removed from workspace successfully'
    });
  } catch (error) {
    next(error);
  }
};