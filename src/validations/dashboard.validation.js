const { z } = require('zod');

const summaryQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const recentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

const trendsQuerySchema = z.object({
  granularity: z.enum(['week', 'month']).optional().default('month'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

module.exports = { summaryQuerySchema, recentQuerySchema, trendsQuerySchema };
