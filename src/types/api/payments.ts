import { z } from 'zod'

export const PaymentStatusSchema = z.enum(['pending', 'under_review', 'approved', 'rejected'])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export const PaymentDetailSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string(),
  paymentDeadline: z.string(),
  status: PaymentStatusSchema,
  proofUrl: z.string().optional(),
  submittedAt: z.string().optional(),
  verifiedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
})
export type PaymentDetail = z.infer<typeof PaymentDetailSchema>

export const SubmitPaymentProofSchema = z.object({
  proofUrl: z.string(),
  notes: z.string().optional(),
})
export type SubmitPaymentProof = z.infer<typeof SubmitPaymentProofSchema>

export const VerifyPaymentRequestSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})
export type VerifyPaymentRequest = z.infer<typeof VerifyPaymentRequestSchema>
