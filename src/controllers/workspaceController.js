import { supabase } from '../config/supabase.js';

// GET /api/v1/workspaces
export const getWorkspaces = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', req.user.id);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/v1/workspaces
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, description, owner_id: req.user.id }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};