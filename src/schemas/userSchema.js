import { z } from 'zod';

// ==========================================
// 1. AUTHENTICATION & PROFILE SCHEMAS
// ==========================================
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must contain numbers only'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).trim().optional(),
    full_name: z.string().min(2).trim().optional(),
    phone_number: z.string().optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional(),
    avatar_url: z.string().url('Invalid avatar URL').optional(),
    job_title: z.string().optional(),
    department: z.string().optional(),
    time_zone: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required').optional(),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    emailTaskAssigned: z.boolean().optional(),
    emailCommentMentioned: z.boolean().optional(),
    inAppTaskAssigned: z.boolean().optional(),
    inAppCommentMentioned: z.boolean().optional(),
  }),
});

// ==========================================
// 2. WORKSPACE SCHEMAS
// ==========================================
export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Workspace name is required').trim(),
    description: z.string().optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters').trim().optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid workspace ID format'),
  }),
});

export const addWorkspaceMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    role: z.enum(['owner', 'admin', 'member']).default('member'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid workspace ID format'),
  }),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['owner', 'admin', 'member']),
  }),
  params: z.object({
    id: z.string().uuid('Invalid workspace ID format'),
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID format'),
  }),
});

export const workspaceMemberParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID format'),
    userId: z.string().uuid('Invalid user ID format'),
  }),
});
// ==========================================
// 3. TASK SCHEMAS
// ==========================================
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').trim(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date: z.string().datetime().optional().or(z.string().date().optional()),
    project_id: z.string().uuid('Invalid project ID format'),
    workspace_id: z.string().uuid('Invalid workspace ID format'),
    assigned_to: z.string().uuid('Invalid user ID format').optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).trim().optional(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date: z.string().datetime().optional().or(z.string().date().optional()),
    assigned_to: z.string().uuid().optional().nullable(),
  }),
  params: z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'completed']),
  }),
  params: z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  }),
});

export const bulkUpdateTasksSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().uuid('Invalid task ID format')).min(1, 'taskIds must be a non-empty array'),
    updates: z.object({
      status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'completed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assigned_to: z.string().uuid().optional().nullable(),
    }),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  }),
});

export const projectTasksParamSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
  }),
});