const User = require('../models/User');
const { AppError } = require('../utils/AppError');

async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({
      data: users.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (e) {
    next(e);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password, name, role, isActive } = req.body;
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name,
      role,
      isActive,
    });
    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (e) {
    next(e);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString() && req.body.role && req.body.role !== req.user.role) {
      throw new AppError('You cannot change your own role', 403);
    }
    if (id === req.user._id.toString() && req.body.isActive === false) {
      throw new AppError('You cannot deactivate your own account', 403);
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await User.hashPassword(updates.password);
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (e) {
    next(e);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      throw new AppError('You cannot delete your own account', 403);
    }
    const user = await User.findByIdAndDelete(id).lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
