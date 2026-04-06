const { AppError } = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = {
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    };
    return res.status(err.statusCode).json(body);
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier' });
  }

  if (err.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
    );
    return res.status(422).json({ error: 'Validation failed', details });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ error: `Duplicate value for ${field}` });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
