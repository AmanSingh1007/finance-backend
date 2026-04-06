const { AppError } = require('../utils/AppError');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const details = parsed.error.flatten();
      return next(
        new AppError('Validation failed', 422, {
          fieldErrors: details.fieldErrors,
          formErrors: details.formErrors,
        })
      );
    }
    req[source] = parsed.data;
    next();
  };
}

module.exports = { validate };
