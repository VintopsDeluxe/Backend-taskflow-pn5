import { appEvents } from './eventEmitter.js';
import { emailQueue } from '../queues/emailQueue.js';
import { supabase } from '../config/supabase.js';

// Default BullMQ job configuration with exponential backoff retries
const defaultJobOptions = {
  attempts: 5, // Retry up to 5 times if SMTP drops
  backoff: {
    type: 'exponential',
    delay: 2000, // Retries at 2s, 4s, 8s, 16s...
  },
  removeOnComplete: true, // Clean up successful jobs automatically
  removeOnFail: false, // Retain failed jobs in Redis for inspection
};

// 1. Listen for Task Assignment Event
appEvents.on('task.assigned', async ({ taskId, assigneeId, taskTitle, assignerName }) => {
  try {
    // Check user preference before queueing
    const { data: pref } = await supabase
      .from('user_preferences')
      .select('email_task_assigned')
      .eq('user_id', assigneeId)
      .maybeSingle();

    if (pref && pref.email_task_assigned === false) {
      console.log(`[Email Skipped] User ${assigneeId} opted out of task assignment emails.`);
      return;
    }

    // Fetch assignee profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', assigneeId)
      .single();

    if (!profile?.email) return;

    // Enqueue job into Redis via BullMQ
    await emailQueue.add(
      'sendTaskAssignmentEmail',
      {
        to: profile.email,
        subject: `New Task Assignment: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2563eb;">You've been assigned a task!</h2>
            <p>Hi <strong>${profile.full_name || 'Team Member'}</strong>,</p>
            <p><strong>${assignerName || 'A teammate'}</strong> assigned you to a task on TaskFlow:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3 style="margin: 0;">${taskTitle}</h3>
            </div>
            <p>Log into your workspace to view complete task specifications and deadlines.</p>
          </div>
        `,
      },
      defaultJobOptions
    );
  } catch (err) {
    console.error('Task assignment email queueing failed:', err.message);
  }
});

// 2. Listen for Task Comments / Mention Event
appEvents.on('comment.mentioned', async ({ taskId, mentionedUserId, commentText, commenterName }) => {
  try {
    // Check user preference before queueing
    const { data: pref } = await supabase
      .from('user_preferences')
      .select('email_comment_mentioned')
      .eq('user_id', mentionedUserId)
      .maybeSingle();

    if (pref && pref.email_comment_mentioned === false) {
      console.log(`[Email Skipped] User ${mentionedUserId} opted out of comment mention emails.`);
      return;
    }

    // Fetch recipient profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id',mentionedUserId)
      .single();

    if (!profile?.email) return;

    // Enqueue job into Redis via BullMQ
    await emailQueue.add(
      'sendCommentMentionEmail',
      {
        to: profile.email,
        subject: `New Comment Mention on TaskFlow`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2563eb;">New Activity on Your Task</h2>
            <p>Hi <strong>${profile.full_name || 'Team Member'}</strong>,</p>
            <p><strong>${commenterName || 'A teammate'}</strong> mentioned you in a comment:</p>
            <blockquote style="background-color: #f9fafb; padding: 12px; border-left: 3px solid #9ca3af; font-style: italic;">
              "${commentText}"
            </blockquote>
          </div>
        `,
      },
      defaultJobOptions
    );
  } catch (err) {
    console.error('Comment mention email queueing failed:', err.message);
  }
});