const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Parses Bearer JWT, loads active user, attaches req.user
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Server misconfiguration', 500);
    }
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
    const userId = payload.sub;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, signToken };
