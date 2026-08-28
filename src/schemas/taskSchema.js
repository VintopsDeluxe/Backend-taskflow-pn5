import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').trim(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date: z.string().datetime().optional().or(z.string().date().optional()),
    project_id: z.string().uuid('Invalid project ID format'),
    workspace_id: z.string().uuid('Invalid workspace ID format'), // <-- Must be present here
    assigned_to: z.string().uuid('Invalid user ID format').optional().nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'completed']),
  }),
  params: z.object({
    taskId: z.string().uuid('Invalid task ID format').optional(),
  }),
});

export const paginationQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
    })
    .optional(),
  params: z
    .object({
      projectId: z.string().uuid('Invalid project ID format').optional(),
    })
    .optional(),
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