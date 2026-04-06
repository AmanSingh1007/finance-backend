const FinancialRecord = require('../models/FinancialRecord');

function buildDateMatch(from, to) {
  const match = { deletedAt: null };
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = from;
    if (to) match.date.$lte = to;
  }
  return match;
}

/**
 * @param {{ from?: Date, to?: Date }} range
 */
async function getSummary(range) {
  const match = buildDateMatch(range.from, range.to);

  const [totals] = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
  ]);

  const totalIncome = totals?.totalIncome ?? 0;
  const totalExpense = totals?.totalExpense ?? 0;

  const byCategory = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: {
            type: '$_id.type',
            total: '$total',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const categoryRows = byCategory.map((row) => {
    let income = 0;
    let expense = 0;
    for (const b of row.breakdown) {
      if (b.type === 'income') income = b.total;
      if (b.type === 'expense') expense = b.total;
    }
    return { category: row._id, income, expense, net: income - expense };
  });

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    byCategory: categoryRows,
    dateRange: {
      from: range.from ?? null,
      to: range.to ?? null,
    },
  };
}

/**
 * @param {number} limit
 */
async function getRecent(limit) {
  return FinancialRecord.find({ deletedAt: null })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name email')
    .lean();
}

/**
 * @param {{ granularity: 'week' | 'month', from?: Date, to?: Date }} opts
 */
async function getTrends(opts) {
  const unit = opts.granularity === 'week' ? 'week' : 'month';
  const match = buildDateMatch(opts.from, opts.to);

  const rows = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$date', unit, timezone: 'UTC' },
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({
    periodStart: r._id,
    income: r.income,
    expense: r.expense,
    net: r.income - r.expense,
  }));
}

module.exports = { getSummary, getRecent, getTrends };
