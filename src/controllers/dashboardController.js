const dashboardService = require('../services/dashboardService');

async function summary(req, res, next) {
  try {
    const data = await dashboardService.getSummary({
      from: req.query.from,
      to: req.query.to,
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function recent(req, res, next) {
  try {
    const items = await dashboardService.getRecent(req.query.limit);
    res.json({ data: items });
  } catch (e) {
    next(e);
  }
}

async function trends(req, res, next) {
  try {
    const items = await dashboardService.getTrends({
      granularity: req.query.granularity,
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ granularity: req.query.granularity, data: items });
  } catch (e) {
    next(e);
  }
}

module.exports = { summary, recent, trends };
