import { supabase } from '../config/supabase.js';

export const getFilesByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const { data, error } = await supabase
      .from('file_attachments')
      .select('*, uploader:profiles(full_name)')
      .eq('task_id', taskId);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const registerAttachment = async (req, res, next) => {
  try {
    const { task_id, project_id, file_name, file_path, file_size, file_type } = req.body;

    if (!file_name || !file_path || !file_size || !file_type) {
      return res.status(400).json({ success: false, message: 'Missing file metadata fields.' });
    }

    const { data, error } = await supabase
      .from('file_attachments')
      .insert([{
        task_id,
        project_id,
        file_name,
        file_path,
        file_size,
        file_type,
        uploaded_by: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('file_attachments').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Attachment record removed.' });
  } catch (error) {
    next(error);
  }
};