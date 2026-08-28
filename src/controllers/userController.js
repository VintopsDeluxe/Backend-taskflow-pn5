import { supabase } from '../config/supabase.js';

// ==========================================
// PROFILE CONTROLLERS
// ==========================================

export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { full_name, phone_number, avatar_url, job_title, department, time_zone } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone_number,
        avatar_url,
        job_title,
        department,
        time_zone,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required',
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateAccount = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NOTIFICATION CONTROLLERS
// ==========================================

export const getUserNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NOTIFICATION PREFERENCE CONTROLLERS
// ==========================================

export const getUserPreferences = async (req, res, next) => {
  try {
    let { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      data = {
        user_id: req.user.id,
        email_task_assigned: true,
        email_comment_mentioned: true,
        in_app_task_assigned: true,
        in_app_comment_mentioned: true,
      };
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateUserPreferences = async (req, res, next) => {
  try {
    const { emailTaskAssigned, emailCommentMentioned, inAppTaskAssigned, inAppCommentMentioned } = req.body;

    const payload = {
      user_id: req.user.id,
      updated_at: new Date().toISOString(),
    };

    if (emailTaskAssigned !== undefined) payload.email_task_assigned = emailTaskAssigned;
    if (emailCommentMentioned !== undefined) payload.email_comment_mentioned = emailCommentMentioned;
    if (inAppTaskAssigned !== undefined) payload.in_app_task_assigned = inAppTaskAssigned;
    if (inAppCommentMentioned !== undefined) payload.in_app_comment_mentioned = inAppCommentMentioned;

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};