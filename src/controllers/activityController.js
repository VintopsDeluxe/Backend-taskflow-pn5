import { supabase } from '../config/supabase.js';

// GET /api/v1/activity-logs/project/:projectId
export const getProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    // 1. Verify project exists & user belongs to parent workspace
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('workspace_id')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', project.workspace_id)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied to this project activity' });
    }

    // 2. Query activity logs with pagination and user profile join
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: activity, count, error } = await supabase
      .from('activity_logs')
      .select(
        `
        id,
        action,
        description,
        metadata,
        created_at,
        task_id,
        user:user_id(id, full_name, email, avatar_url)
      `,
        { count: 'exact' }
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: activity,
      pagination: {
        totalRecords: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/activity-logs/workspace/:workspaceId
export const getWorkspaceActivity = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    // Verify workspace membership
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied to this workspace activity' });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: activity, count, error } = await supabase
      .from('activity_logs')
      .select(
        `
        id,
        action,
        description,
        metadata,
        created_at,
        project_id,
        task_id,
        user:user_id(id, full_name, email, avatar_url)
      `,
        { count: 'exact' }
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: activity,
      pagination: {
        totalRecords: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};