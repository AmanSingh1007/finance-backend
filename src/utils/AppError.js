class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {object} [details]
   */
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
