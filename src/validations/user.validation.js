const { z } = require('zod');
const { ROLE_LIST } = require('../constants/roles');

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(120),
  role: z.enum(ROLE_LIST),
  isActive: z.boolean().optional().default(true),
});

const updateUserSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    role: z.enum(ROLE_LIST).optional(),
    isActive: z.boolean().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

const idParamSchema = z.object({
  id: z.string().length(24).regex(/^[a-f0-9]+$/i),
});

module.exports = { createUserSchema, updateUserSchema, idParamSchema };
