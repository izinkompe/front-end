import { z } from 'zod'

export const ComplaintTypeSchema = z.enum([
  'weight_discrepancy',
  'quality_issue',
  'pickup_failure',
  'cancellation_request',
  'other',
])
export type ComplaintType = z.infer<typeof ComplaintTypeSchema>

export const ComplaintStatusSchema = z.enum(['open', 'in_investigation', 'resolved', 'closed'])
export type ComplaintStatus = z.infer<typeof ComplaintStatusSchema>

export const ComplaintSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  reporterId: z.string(),
  reporterName: z.string(),
  type: ComplaintTypeSchema,
  description: z.string(),
  evidencePhotos: z.array(z.string()).optional(),
  status: ComplaintStatusSchema,
  adminResolution: z.string().optional(),
  refundAmount: z.number().optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
})
export type Complaint = z.infer<typeof ComplaintSchema>
