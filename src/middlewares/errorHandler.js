import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]:', err);

  // 1. Zod Validation Errors (if not caught directly in validate middleware)
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 2. Supabase / Postgres Database Error Codes
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation (e.g. duplicate email or title)
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists.',
        });
      case '23503': // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          message: 'Referenced record does not exist.',
        });
      case 'PGRST116': // Supabase .single() returned 0 rows
        return res.status(404).json({
          success: false,
          message: 'Resource not found.',
        });
      default:
        break;
    }
  }

  // 3. Fallback General Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};