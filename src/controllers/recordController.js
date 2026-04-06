const FinancialRecord = require('../models/FinancialRecord');
const { AppError } = require('../utils/AppError');

function buildListFilter(query, user) {
  const filter = {};
  const isAdmin = user.role === 'admin';

  if (!query.includeDeleted || !isAdmin) {
    filter.deletedAt = null;
  }

  if (query.type) filter.type = query.type;
  if (query.category) {
    filter.category = new RegExp(
      `^${query.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      'i'
    );
  }
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }
  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    filter.$or = [
      { category: new RegExp(term, 'i') },
      { notes: new RegExp(term, 'i') },
    ];
  }
  return filter;
}

async function listRecords(req, res, next) {
  try {
    const { page, limit, ...query } = req.query;
    const filter = buildListFilter(query, req.user);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FinancialRecord.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      FinancialRecord.countDocuments(filter),
    ]);

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function getRecord(req, res, next) {
  try {
    const record = await FinancialRecord.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    if (!record) {
      throw new AppError('Record not found', 404);
    }
    if (record.deletedAt && req.user.role !== 'admin') {
      throw new AppError('Record not found', 404);
    }
    res.json(record);
  } catch (e) {
    next(e);
  }
}

async function createRecord(req, res, next) {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user._id,
    };
    const record = await FinancialRecord.create(payload);
    await record.populate('createdBy', 'name email');
    res.status(201).json(record.toObject());
  } catch (e) {
    next(e);
  }
}

async function updateRecord(req, res, next) {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      deletedAt: null,
    });
    if (!record) {
      throw new AppError('Record not found', 404);
    }
    Object.assign(record, req.body);
    await record.save();
    await record.populate('createdBy', 'name email');
    res.json(record.toObject());
  } catch (e) {
    next(e);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const record = await FinancialRecord.findById(req.params.id);
    if (!record) {
      throw new AppError('Record not found', 404);
    }
    if (record.deletedAt) {
      throw new AppError('Record already deleted', 400);
    }
    record.deletedAt = new Date();
    await record.save();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
