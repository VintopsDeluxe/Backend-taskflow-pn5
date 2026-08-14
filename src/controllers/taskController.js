import { supabase } from '../config/supabase.js';
import { appEvents } from '../events/eventEmitter.js';

// Strict Kanban state machine transition rules
const VALID_STATUS_TRANSITIONS = {
  todo: ['in_progress'],
  in_progress: ['completed', 'todo'],
  completed: ['in_progress'],
};

// GET /api/v1/tasks/project/:projectId
export const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, priority, startDate, endDate } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId);

    // Apply filtering options
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    // Apply calendar date-range filters
    if (startDate) query = query.gte('due_date', startDate);
    if (endDate) query = query.lte('due_date', endDate);

    const { data, count, error } = await query
      .order('due_date', { ascending: true })
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

// POST /api/v1/tasks
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
      workspace_id,
      assigned_to,
    } = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          status: status || 'todo',
          priority: priority || 'medium',
          due_date,
          project_id,
          workspace_id,
          assigned_to,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 1. Emit event for Activity Feed Logger
    appEvents.emit('task.created', {
      taskId: data.id,
      projectId: data.project_id,
      workspaceId: data.workspace_id,
      userId: req.user.id,
      title: data.title,
    });

    // 2. Emit event for Email Worker if assigned to a teammate
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

// PATCH /api/v1/tasks/:taskId/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status: newStatus } = req.body;

    // 1. Fetch current task state
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, status, project_id, workspace_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // 2. State Machine Check: Validate allowed state transition
    const allowedNextStates = VALID_STATUS_TRANSITIONS[currentTask.status] || [];
    if (!allowedNextStates.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition from '${currentTask.status}' to '${newStatus}'. Allowed: ${allowedNextStates.join(', ')}`,
      });
    }

    // 3. Perform update
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Emit status update event for Activity Logs
    appEvents.emit('task.status_updated', {
      taskId: updatedTask.id,
      workspaceId: currentTask.workspace_id,
      projectId: currentTask.project_id,
      userId: req.user.id,
      oldStatus: currentTask.status,
      newStatus,
    });

    // 5. Emit completed event if task status is completed
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