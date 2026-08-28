import multer from 'multer';
import { getSupabaseClient } from '../config/supabase.js';
import { appEvents } from '../events/eventEmitter.js';

const BUCKET_NAME = 'task-attachments';

// 1. Configure Multer to hold the file temporarily in memory buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Export this middleware to use in your routes before the controller
export const uploadSingleFile = upload.single('file'); // 'file' matches your Postman form-data key

/**
 * GET /api/v1/files/task/:taskId
 * Fetch all file attachments for a task and append signed download URLs.
 */
export const getFilesByTask = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required.' });
    }

    const { data: attachments, error } = await supabaseUser
      .from('file_attachments')
      .select('*, uploader:profiles(full_name, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const filesWithUrls = await Promise.all(
      (attachments || []).map(async (file) => {
        const { data: signedData } = await supabaseUser.storage
          .from(BUCKET_NAME)
          .createSignedUrl(file.file_path, 3600);

        return {
          ...file,
          download_url: signedData?.signedUrl || null,
        };
      })
    );

    res.status(200).json({ success: true, data: filesWithUrls });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/files
 * Handles raw file upload, pushes to Supabase Storage, and saves metadata.
 */
export const uploadAndRegisterAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const supabaseUser = getSupabaseClient(req);
    const { task_id, project_id, workspace_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ success: false, message: 'task_id is required in form-data.' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${task_id}/${fileName}`;

    // 1. Upload physical file to Supabase Storage Bucket
    const { error: storageError } = await supabaseUser.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) throw storageError;

    // 2. Save metadata to `file_attachments` table
    const { data: attachment, error: dbError } = await supabaseUser
      .from('file_attachments')
      .insert([
        {
          task_id,
          project_id: project_id || null,
          file_name: file.originalname,
          file_path: filePath,
          file_size: file.size,
          file_type: file.mimetype,
          uploaded_by: req.user.id,
        },
      ])
      .select('*, uploader:profiles(full_name, avatar_url)')
      .single();

    if (dbError) throw dbError;

    // 3. Emit event for activity log history
    if (workspace_id && project_id) {
      appEvents.emit('file.uploaded', {
        taskId: task_id,
        projectId: project_id,
        workspaceId: workspace_id,
        userId: req.user.id,
        fileName: file.originalname,
      });
    }

    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/files/:id
 * Removes physical file from Supabase Storage bucket AND deletes metadata row.
 */
export const deleteAttachment = async (req, res, next) => {
  try {
    const supabaseUser = getSupabaseClient(req);
    const { id } = req.params;
    const userId = req.user.id;

    const { data: fileRecord, error: fetchError } = await supabaseUser
      .from('file_attachments')
      .select('id, file_path, uploaded_by, task_id, project_id')
      .eq('id', id)
      .single();

    if (fetchError || !fileRecord) {
      return res.status(404).json({ success: false, message: 'Attachment record not found.' });
    }

    if (fileRecord.uploaded_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete attachments uploaded by you.',
      });
    }

    const { error: storageError } = await supabaseUser.storage
      .from(BUCKET_NAME)
      .remove([fileRecord.file_path]);

    if (storageError) {
      console.error('Storage bucket deletion warning:', storageError.message);
    }

    const { error: deleteError } = await supabaseUser
      .from('file_attachments')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.status(200).json({ success: true, message: 'Attachment removed successfully.' });
  } catch (error) {
    next(error);
  }
};