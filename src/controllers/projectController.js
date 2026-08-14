import { supabase } from '../config/supabase.js';

export const getProjectsByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select('*, owner:profiles(full_name, avatar_url)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { workspace_id, name, description, status, color_label, start_date, end_date } = req.body;

    if (!workspace_id || !name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: workspace_id, name, start_date, and end_date are required.'
      });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        workspace_id,
        name,
        description,
        owner_id: req.user.id,
        status: status || 'Planning',
        color_label: color_label || '#3B82F6',
        start_date,
        end_date
      }])
      .select()
      .single();

    if (error) throw error;

    // Automatically add creator to project_members
    await supabase.from('project_members').insert([
      { project_id: project.id, user_id: req.user.id }
    ]);

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};