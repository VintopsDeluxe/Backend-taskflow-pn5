export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Safely assign parsed values back to req
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) Object.assign(req.params, parsed.params);
    if (parsed.query) {
      // Clear existing query params and assign parsed/coerced ones
      for (const key in req.query) delete req.query[key];
      Object.assign(req.query, parsed.query);
    }

    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const formattedErrors = (error.errors || error.issues || []).map((err) => {
        const pathArray = Array.isArray(err.path) ? err.path : [];
        const fieldName = pathArray.length > 1 
          ? pathArray.slice(1).join('.') 
          : (pathArray[0] || 'root');

        return {
          field: fieldName,
          message: err.message,
        };
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    next(error);
  }
};