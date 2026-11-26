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

export const RefundBankAccountSchema = z.object({
  bankName: z.string().trim().min(2).max(60),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{5,24}$/),
  accountHolderName: z.string().trim().min(2).max(120),
})
export type RefundBankAccount = z.infer<typeof RefundBankAccountSchema>

export const ComplaintMessageSchema = z.object({
  id: z.string(),
  senderRole: z.enum(['admin', 'buyer']),
  senderName: z.string(),
  message: z.string(),
  attachments: z.array(z.string()).optional(),
  createdAt: z.string(),
})
export type ComplaintMessage = z.infer<typeof ComplaintMessageSchema>

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
  refundBankAccount: RefundBankAccountSchema.optional(),
  refundStatus: z.enum(['not_required', 'pending_transfer', 'transferred']).optional(),
  refundProofUrl: z.string().optional(),
  clarificationMessages: z.array(ComplaintMessageSchema).optional(),
  refundAmount: z.number().optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
})
export type Complaint = z.infer<typeof ComplaintSchema>

export const CreateComplaintRequestSchema = z.object({
  orderId: z.string().min(1),
  type: ComplaintTypeSchema,
  description: z.string().trim().min(5).max(2000),
  evidencePhotos: z.array(z.string()).max(3).optional(),
  refundBankAccount: RefundBankAccountSchema.optional(),
})
export type CreateComplaintRequest = z.infer<typeof CreateComplaintRequestSchema>

export const ReplyComplaintRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  attachments: z.array(z.string()).max(3).optional(),
})
export type ReplyComplaintRequest = z.infer<typeof ReplyComplaintRequestSchema>
