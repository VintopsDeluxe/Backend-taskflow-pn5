import { supabase } from '../config/supabase.js';

export const getProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: activity, count, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        action_type,
        description,
        metadata,
        created_at,
        user_id,
        task_id
      `, { count: 'exact' })
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(200).json({
      success: true,
      data: activity,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};