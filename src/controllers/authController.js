const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { signToken } = require('../middleware/auth');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      throw new AppError('Invalid email or password', 401);
    }
    const token = signToken(user._id.toString());
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { login };
