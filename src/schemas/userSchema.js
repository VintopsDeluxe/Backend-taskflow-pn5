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
    avatarUrl: z.string().url('Invalid avatar URL').optional(),
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

export const addWorkspaceMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    role: z.enum(['owner', 'admin', 'member']).default('member'),
  }),
});

// ==========================================
// 3. PROJECT & TASK SCHEMAS (Kanban Support)
// ==========================================
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name required').trim(),
    description: z.string().optional(),
    workspaceId: z.string().uuid('Invalid workspace ID format'),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title required').trim(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    dueDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional(),
    projectId: z.string().uuid('Invalid project ID'),
    workspaceId: z.string().uuid('Invalid workspace ID'),
    assignedTo: z.string().uuid('Invalid user ID').optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'completed']),
  }),
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

// ==========================================
// 4. COMMENT SCHEMAS
// ==========================================
export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment text cannot be empty').trim(),
    taskId: z.string().uuid('Invalid task ID'),
  }),
});

// ==========================================
// 5. QUERY PAGINATION & FILTER SCHEMAS
// ==========================================
export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['todo', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: z.string().datetime({ message: 'startDate must be a valid ISO string' }).optional(),
    endDate: z.string().datetime({ message: 'endDate must be a valid ISO string' }).optional(),
  }),
});