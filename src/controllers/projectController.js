
import { getSupabaseClient } from '../config/supabase.js';
import { supabase } from '../config/supabase.js';

// GET /api/v1/projects/workspace/:workspaceId
export const getProjectsByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const supabaseUser = getSupabaseClient(req);
    // 1. Verify user is a member of the workspace
    const { data: membership, error: memberError } = await supabaseUser
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this workspace',
      });
    }

    const { data, error } = await supabaseUser
      .from('projects')
      .select('*, owner:profiles!owner_id(full_name, avatar_url)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/projects
export const createProject = async (req, res, next) => {
  try {
    const { workspace_id, name, description, status, color_label, start_date, end_date } = req.body;
    const userId = req.user.id;

    if (!workspace_id || !name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: workspace_id, name, start_date, and end_date are required.',
      });
    }

    

    // 1. Initialize supabaseUser here!
    const supabaseUser = getSupabaseClient(req);

    

    // Check workspace membership before creation
    const { data: membership, error: memberError } = await supabaseUser
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', userId)
      .maybeSingle(); 

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot create projects in a workspace you do not belong to',
      });
    }

    // 2. Insert project using supabaseUser (FIXED from global supabase)
    const { data: project, error } = await supabaseUser
      .from('projects')
      .insert([
        {
          workspace_id,
          name,
          description,
          owner_id: userId,
          status: status || 'Planning',
          color_label: color_label || '#3B82F6',
          start_date,
          end_date,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("DETAILED SUPABASE ERROR:", JSON.stringify(error, null, 2));
      return res.status(400).json({ success: false, message: error.message });
    }

    // 3. Automatically add creator to project_members using supabaseUser
    const { error: memberInsertError } = await supabaseUser
      .from('project_members')
      .insert([{ project_id: project.id, user_id: userId, role: 'owner' }]);

    if (memberInsertError) {
      console.error('Failed to insert project member:', memberInsertError.message);
    }

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error("Catch error:", error);
    next(error);
  }
};

// PATCH /api/v1/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabaseUser = getSupabaseClient(req);

    // 1. Verify project existence
    const { data: project, error: fetchError } = await supabaseUser
      .from('projects')
      .select('workspace_id, owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    delete updates.id;
    delete updates.workspace_id;
    delete updates.owner_id;

    const { data, error } = await supabaseUser
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabaseUser = getSupabaseClient(req);

    const { data: project, error: fetchError } = await supabaseUser
      .from('projects')
      .select('workspace_id, owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { error } = await supabaseUser.from('projects').delete().eq('id', id);
    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};