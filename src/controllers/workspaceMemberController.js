import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

// 1. Invite User to Workspace
export const inviteWorkspaceMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = 'member' } = req.body;
    const invitedBy = req.user.id;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

    const { data: invitation, error } = await supabaseAdmin
      .from('workspace_invitations')
      .insert({
        workspace_id: workspaceId,
        email,
        role,
        token,
        status: 'pending',
        invited_by: invitedBy,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${email}`,
      data: {
        invite_token: token
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Accept Invitation
export const acceptWorkspaceInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from('workspace_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteErr || !invite) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation token.' });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This invitation has expired.' });
    }

    if (invite.email !== userEmail) {
      return res.status(403).json({ success: false, message: 'This invitation belongs to a different email address.' });
    }

    const { error: memberErr } = await supabaseAdmin
      .from('workspace_members')
      .insert({
        workspace_id: invite.workspace_id,
        user_id: userId,
        role: invite.role
      });

    if (memberErr) throw memberErr;

    await supabaseAdmin
      .from('workspace_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    res.status(200).json({
      success: true,
      message: 'Successfully joined the workspace.'
    });
  } catch (error) {
    next(error);
  }
};

// 3. Update Member Role
export const updateMemberRole = async (req, res, next) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { newRole } = req.body;

    if (!['admin', 'member'].includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified. Choose "admin" or "member".' });
    }

    const { data: updatedMember, error } = await supabaseAdmin
      .from('workspace_members')
      .update({ role: newRole })
      .eq('workspace_id', workspaceId)
      .eq('user_id', memberId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};

// 4. Remove Member from Workspace
export const removeWorkspaceMember = async (req, res, next) => {
  try {
    const { workspaceId, memberId } = req.params;

    const { error } = await supabaseAdmin
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', memberId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Member removed from workspace successfully.'
    });
  } catch (error) {
    next(error);
  }
};