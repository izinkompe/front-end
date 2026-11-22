import { z } from 'zod'

export const VerificationStatusSchema = z.enum([
  'pending',
  'under_review',
  'revision_needed',
  'approved',
  'rejected',
])
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>

export const FarmerVerificationSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  farmerName: z.string(),
  farmName: z.string(),
  farmLocation: z.string(),
  idCardNumber: z.string(),
  documentUrls: z.array(z.string()),
  status: VerificationStatusSchema,
  adminNotes: z.string().optional(),
  submittedAt: z.string(),
  reviewedAt: z.string().optional(),
})
export type FarmerVerification = z.infer<typeof FarmerVerificationSchema>
