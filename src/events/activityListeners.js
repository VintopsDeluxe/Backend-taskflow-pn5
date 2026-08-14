import { appEvents } from './eventEmitter.js';
import { supabase } from '../config/supabase.js';

// Helper to write activity log entries safely
const logActivity = async ({ workspaceId, projectId, taskId, userId, actionType, description, metadata = {} }) => {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      workspace_id: workspaceId,
      project_id: projectId,
      task_id: taskId,
      user_id: userId,
      action_type: actionType,
      description,
      metadata,
    });
    if (error) console.error('Failed to write activity log:', error.message);
  } catch (err) {
    console.error('Activity logger error:', err);
  }
};

// Listen for Task Creation
appEvents.on('task.created', async (data) => {
  await logActivity({
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    taskId: data.taskId,
    userId: data.userId,
    actionType: 'TASK_CREATED',
    description: `created task "${data.title}"`,
  });
});

// Listen for Task Status Updates (Kanban transitions)
appEvents.on('task.status_updated', async (data) => {
  await logActivity({
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    taskId: data.taskId,
    userId: data.userId,
    actionType: 'STATUS_UPDATED',
    description: `moved task status from ${data.oldStatus} to ${data.newStatus}`,
    metadata: { oldStatus: data.oldStatus, newStatus: data.newStatus },
  });
});

// Listen for Task Comments
appEvents.on('comment.created', async (data) => {
  await logActivity({
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    taskId: data.taskId,
    userId: data.userId,
    actionType: 'COMMENT_ADDED',
    description: `commented on a task`,
  });
});