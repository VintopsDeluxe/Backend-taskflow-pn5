import { supabase } from '../config/supabase.js';

export const getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const { data, error } = await supabase
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
    const { task_id, content, parent_id } = req.body;

    if (!task_id || !content) {
      return res.status(400).json({ success: false, message: 'task_id and content are required.' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        task_id,
        user_id: req.user.id,
        content,
        parent_id: parent_id || null
      }])
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
    const { id } = req.params;

    const { error } = await supabase.from('comments').delete().eq('id', id).eq('user_id', req.user.id);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Comment removed.' });
  } catch (error) {
    next(error);
  }
};