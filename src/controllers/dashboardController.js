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
      if (t.status !== 'Completed' && new Date(t.due_date) < now) {
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