import { z } from 'zod'

export const CreateStreamSchema = z.object({
  name: z.string()
    .min(1, 'Stream name is required')
    .max(100, 'Stream name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high'])
    .default('medium'),
  status: z.enum(['active', 'completed', 'paused', 'archived'])
    .default('active'),
  start_date: z.string()
    .nullable()
    .optional()
    .transform(val => val || null),
  end_date: z.string()
    .nullable()
    .optional()
    .transform(val => val || null),
  organization_id: z.string()
    .uuid('Invalid organization ID'),
})

export type CreateStreamInput = z.infer<typeof CreateStreamSchema>
