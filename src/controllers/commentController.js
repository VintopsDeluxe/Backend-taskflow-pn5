import { getSupabaseClient } from '../config/supabase.js';

export const getCommentsByTask = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required.' });
    }

    const { data, error } = await supabaseUser
      .from('comments')
      .select('*, author:profiles(full_name, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { task_id, content, parent_id } = req.body;
    const trimmedContent = content?.trim();

    if (!task_id || !trimmedContent) {
      return res
        .status(400)
        .json({ success: false, message: 'task_id and non-empty content are required.' });
    }

    const { data, error } = await supabaseUser
      .from('comments')
      .insert([
        {
          task_id,
          user_id: req.user.id,
          content: trimmedContent,
          parent_id: parent_id || null,
        },
      ])
      .select('*, author:profiles(full_name, avatar_url)')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { id } = req.params;

    const { data, error } = await supabaseUser
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({ success: true, message: 'Comment removed.' });
  } catch (error) {
    next(error);
  }
};