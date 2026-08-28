import { getSupabaseClient } from '../config/supabase.js';
import { appEvents } from '../events/eventEmitter.js';

// Kanban state machine transition rules
const VALID_STATUS_TRANSITIONS = {
  todo: ['in_progress', 'review', 'blocked'],
  in_progress: ['review', 'todo', 'blocked', 'completed'],
  review: ['in_progress', 'completed', 'blocked'],
  blocked: ['todo', 'in_progress'],
  completed: ['in_progress', 'todo'],
};

// GET /api/v1/tasks/project/:projectId
export const getTasksByProject = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    
    const { projectId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, priority, startDate, endDate, search, sortBy = 'due_date', order = 'asc' } = req.query;

    // 1. Verify project exists & user belongs to parent workspace
    const { data: project, error: projError } = await supabaseUser
      .from('projects')
      .select('workspace_id')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { data: membership } = await supabaseUser
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', project.workspace_id)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied to this project' });
    }

    // 2. Build filtered task query
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseUser
      .from('tasks')
      .select('*, assigned_user:assigned_to(id, full_name, email, avatar_url)', { count: 'exact' })
      .eq('project_id', projectId);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (startDate) query = query.gte('due_date', startDate);
    if (endDate) query = query.lte('due_date', endDate);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: order === 'asc' })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/tasks/:taskId
export const getTaskById = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;

    const { data, error } = await supabaseUser
      .from('tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, avatar_url),
        creator:created_by(id, full_name, email),
        project:project_id(id, name, workspace_id)
      `)
      .eq('id', taskId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tasks
export const createTask = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      due_date,
      project_id,
      workspace_id,
      assigned_to,
    } = req.body;
  
    // Temporary debug logs
    console.log("DEBUG - User ID:", req.user?.id);
    console.log("DEBUG - Workspace ID from body:", workspace_id);
    console.log("DEBUG - Project ID from body:", project_id);

    // Verify user is in workspace
    const { data: membership, error: memberError } = await supabaseUser
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', req.user.id)
      .single();

    console.log("MEMBERSHIP QUERY DEBUG:", { membership, memberError, evaluatedUserId: req.user?.id, evaluatedWorkspaceId: workspace_id });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied: Not a workspace member' });
    }

    const { data, error } = await supabaseUser
      .from('tasks')
      .insert([
        {
          title,
          description,
          status,
          priority,
          due_date,
          project_id,
          workspace_id,
          assigned_to,
          created_by: req.user.id,
        },
      ])
      .select('*, assigned_user:assigned_to(id, full_name, email, avatar_url)')
      .single();

    if (error) throw error;

    // Emit event for Activity Log
    appEvents.emit('task.created', {
      taskId: data.id,
      projectId: data.project_id,
      workspaceId: data.workspace_id,
      userId: req.user.id,
      title: data.title,
    });

    // Emit event for Email Worker
    if (data.assigned_to) {
      appEvents.emit('task.assigned', {
        taskId: data.id,
        assigneeId: data.assigned_to,
        taskTitle: data.title,
        assignerName: req.user.full_name || req.user.email,
      });
    }

    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/tasks/:taskId
export const updateTask = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;
    const { title, description, priority, due_date, assigned_to, status } = req.body;

    const { data: existingTask, error: fetchError } = await supabaseUser
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Validate status transition if status is being updated directly here
    if (status && status !== existingTask.status) {
      const allowedNextStates = VALID_STATUS_TRANSITIONS[existingTask.status] || [];
      if (!allowedNextStates.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid state transition from '${existingTask.status}' to '${status}'`,
        });
      }
    }

    const updates = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(due_date !== undefined && { due_date }),
      ...(assigned_to !== undefined && { assigned_to }),
      ...(status !== undefined && { status }),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedTask, error: updateError } = await supabaseUser
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*, assigned_user:assigned_to(id, full_name, email, avatar_url)')
      .single();

    if (updateError) throw updateError;

    if (assigned_to && assigned_to !== existingTask.assigned_to) {
      appEvents.emit('task.assigned', {
        taskId: updatedTask.id,
        assigneeId: assigned_to,
        taskTitle: updatedTask.title,
        assignerName: req.user.full_name || req.user.email,
      });
    }

    appEvents.emit('task.updated', {
      taskId: updatedTask.id,
      projectId: updatedTask.project_id,
      workspaceId: updatedTask.workspace_id,
      userId: req.user.id,
      changes: updates,
    });

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/tasks/:taskId/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;
    const { status: newStatus } = req.body;

    const { data: currentTask, error: fetchError } = await supabaseUser
      .from('tasks')
      .select('id, title, status, project_id, workspace_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const allowedNextStates = VALID_STATUS_TRANSITIONS[currentTask.status] || [];
    if (!allowedNextStates.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition from '${currentTask.status}' to '${newStatus}'. Allowed: ${allowedNextStates.join(', ')}`,
      });
    }

    const { data: updatedTask, error: updateError } = await supabaseUser
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select('*, assigned_user:assigned_to(id, full_name, email, avatar_url)')
      .single();

    if (updateError) throw updateError;

    appEvents.emit('task.status_updated', {
      taskId: updatedTask.id,
      workspaceId: currentTask.workspace_id,
      projectId: currentTask.project_id,
      userId: req.user.id,
      oldStatus: currentTask.status,
      newStatus,
    });

    if (newStatus === 'completed') {
      appEvents.emit('task.completed', {
        taskId: updatedTask.id,
        workspaceId: currentTask.workspace_id,
        userId: req.user.id,
      });
    }

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tasks/:taskId/duplicate
export const duplicateTask = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;

    const { data: original, error: fetchError } = await supabaseUser
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !original) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { data: duplicated, error: createError } = await supabaseUser
      .from('tasks')
      .insert([
        {
          title: `${original.title} (Copy)`,
          description: original.description,
          status: 'todo',
          priority: original.priority,
          due_date: original.due_date,
          project_id: original.project_id,
          workspace_id: original.workspace_id,
          assigned_to: original.assigned_to,
          created_by: req.user.id,
        },
      ])
      .select('*, assigned_user:assigned_to(id, full_name, email, avatar_url)')
      .single();

    if (createError) throw createError;

    appEvents.emit('task.created', {
      taskId: duplicated.id,
      projectId: duplicated.project_id,
      workspaceId: duplicated.workspace_id,
      userId: req.user.id,
      title: duplicated.title,
    });

    return res.status(201).json({ success: true, data: duplicated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/tasks/:taskId
export const deleteTask = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;

    const { data: task, error: fetchError } = await supabaseUser
      .from('tasks')
      .select('id, title, project_id, workspace_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { error: deleteError } = await supabaseUser
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) throw deleteError;

    appEvents.emit('task.deleted', {
      taskId,
      projectId: task.project_id,
      workspaceId: task.workspace_id,
      userId: req.user.id,
      title: task.title,
    });

    return res.status(200).json({ success: true, message: 'Task successfully deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tasks/bulk-update
export const bulkUpdateTasks = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskIds, updates } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, message: 'taskIds must be a non-empty array' });
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseUser
      .from('tasks')
      .update(payload)
      .in('id', taskIds)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `${data.length} tasks updated successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};