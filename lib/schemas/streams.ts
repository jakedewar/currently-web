import { z } from 'zod'

export const CreateStreamSchema = z.object({
  name: z.string()
    .min(1, 'Stream name is required')
    .max(100, 'Stream name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  emoji: z.string()
    .max(10, 'Emoji must be less than 10 characters')
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
  type: z.enum(['url', 'note'])
    .default('url'),
  status: z.enum(['active', 'completed', 'archived'])
    .default('active'),
  url: z.string()
    .url('Invalid URL format')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .default('medium')
    .optional(),
  assignee_id: z.string()
    .uuid('Invalid assignee ID')
    .optional(),
  due_date: z.string()
    .optional(),
  estimated_hours: z.number()
    .positive('Estimated hours must be positive')
    .optional(),
  parent_task_id: z.string()
    .uuid('Invalid parent task ID')
    .optional(),
  order_index: z.number()
    .int('Order index must be an integer')
    .optional(),
  stream_id: z.string()
    .uuid('Invalid stream ID'),
}).refine((data) => {
  // If type is 'url', url field is required
  if (data.type === 'url' && !data.url) {
    return false
  }
  return true
}, {
  message: "URL is required when type is 'url'",
  path: ['url']
})

export type CreateStreamInput = z.infer<typeof CreateStreamSchema>
export type CreateWorkItemInput = z.infer<typeof CreateWorkItemSchema>
