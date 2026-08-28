import { supabase } from '../config/supabase.js';

export const getWorkspaceSummary = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // 1. Get Projects
    const { data: projects, error: projErr } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('workspace_id', workspaceId);

    if (projErr) throw projErr;

    const projectIds = projects.map(p => p.id);

    if (projectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { totalProjects: 0, totalTasks: 0, statusBreakdown: {}, overdueTasks: 0 }
      });
    }

    // 2. Get Tasks
    const { data: tasks, error: taskErr } = await supabase
      .from('tasks')
      .select('id, status, due_date')
      .in('project_id', projectIds);

    if (taskErr) throw taskErr;

    const now = new Date();
    const statusBreakdown = { 'To Do': 0, 'In Progress': 0, 'Review': 0, 'Blocked': 0, 'Completed': 0 };
    let overdueCount = 0;

    tasks.forEach(t => {
      if (statusBreakdown[t.status] !== undefined) {
        statusBreakdown[t.status]++;
      }
      // Updated line:
      if (t.due_date && t.status !== 'Completed' && new Date(t.due_date) < now) {
        overdueCount++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        statusBreakdown,
        overdueTasks: overdueCount
      }
    });
  } catch (error) {
    next(error);
  }
};
export const getUserDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id; // From your auth middleware

    // 1. Fetch total tasks assigned to the user
    const { count: totalTasks, error: taskError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId);

    if (taskError) throw taskError;

    // 2. Fetch completed tasks for the user
    const { count: completedTasks, error: completedError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('status', 'completed');

    if (completedError) throw completedError;

    // 3. Fetch workspaces the user belongs to
    const { count: totalWorkspaces, error: workspaceError } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (workspaceError) throw workspaceError;

    res.status(200).json({
      success: true,
      data: {
        total_workspaces: totalWorkspaces || 0,
        assigned_tasks: totalTasks || 0,
        completed_tasks: completedTasks || 0,
        pending_tasks: (totalTasks || 0) - (completedTasks || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};