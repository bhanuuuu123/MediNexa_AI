/**
 * Validation middleware that applies Zod schemas to incoming requests
 * Catches validation errors and returns standardized error responses
 */

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated; // Replace with sanitized data
      next();
    } catch (error) {
      res.status(400);
      const errorMessage = error.errors?.[0]?.message || "Validation failed";
      next(new Error(errorMessage));
    }
  };
}
