const { z } = require('zod');

const recordType = z.enum(['income', 'expense']);

const createRecordSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: recordType,
  category: z.string().min(1).max(80),
  date: z.coerce.date(),
  notes: z.string().max(2000).optional().default(''),
});

const updateRecordSchema = z
  .object({
    amount: z.coerce.number().positive().optional(),
    type: recordType.optional(),
    category: z.string().min(1).max(80).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

const listRecordsQuerySchema = z.object({
  type: recordType.optional(),
  category: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  includeDeleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

const idParamSchema = z.object({
  id: z.string().length(24).regex(/^[a-f0-9]+$/i),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema,
  idParamSchema,
};
