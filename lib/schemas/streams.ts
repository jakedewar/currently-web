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

export const CreateWorkItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  type: z.enum(['url'])
    .default('url'),
  status: z.enum(['active', 'completed', 'archived'])
    .default('active'),
  url: z.string()
    .url('Invalid URL format')
    .min(1, 'URL is required'),
  stream_id: z.string()
    .uuid('Invalid stream ID'),
})

export type CreateStreamInput = z.infer<typeof CreateStreamSchema>
export type CreateWorkItemInput = z.infer<typeof CreateWorkItemSchema>
