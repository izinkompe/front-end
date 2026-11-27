import { z } from 'zod'
import { ScheduleSlotSchema } from './offers'

export const OrderStatusSchema = z.enum([
  'pending_payment',
  'payment_submitted',
  'processing',
  'ready_for_pickup',
  'completed',
  'cancelled',
  'disputed',
])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

export const OrderPickupLocationSchema = z.object({
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
})
export type OrderPickupLocation = z.infer<typeof OrderPickupLocationSchema>

export const OrderBankAccountSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolderName: z.string(),
})
export type OrderBankAccount = z.infer<typeof OrderBankAccountSchema>

export const OrderBuyerAddressSchema = z.object({
  label: z.string(),
  fullAddress: z.string(),
  areaName: z.string(),
})
export type OrderBuyerAddress = z.infer<typeof OrderBuyerAddressSchema>

export const ScheduleProposalStatusSchema = z.enum(['pending', 'accepted', 'rejected'])
export type ScheduleProposalStatus = z.infer<typeof ScheduleProposalStatusSchema>

export const OrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  farmerId: z.string(),
  farmerName: z.string().optional(),
  farmId: z.string().optional(),
  offerId: z.string(),
  commodityName: z.string(),
  commodityPhotoUrl: z.string().optional(),
  quantityKg: z.number().positive(),
  pricePerKg: z.number().positive(),
  totalPrice: z.number().positive(),
  scheduleSlot: ScheduleSlotSchema,
  proposedScheduleSlot: ScheduleSlotSchema.optional(),
  scheduleProposalStatus: ScheduleProposalStatusSchema.optional(),
  scheduleProposalNote: z.string().optional(),
  paymentDeadline: z.string(),
  status: OrderStatusSchema,
  confirmedWeightKg: z.number().nonnegative().optional(),
  receiptConfirmedAt: z.string().optional(),
  weightDiscrepancyNote: z.string().optional(),
  restockDecision: z.enum(['restocked', 'discarded']).optional(),
  restockDecidedAt: z.string().optional(),
  restockNote: z.string().optional(),
  pickupLocation: OrderPickupLocationSchema,
  buyerContactName: z.string().optional(),
  buyerContactPhone: z.string().optional(),
  buyerOrganization: z.string().optional(),
  buyerAddress: OrderBuyerAddressSchema.optional(),
  bankAccount: OrderBankAccountSchema.optional(),
  paymentProofUrl: z.string().optional(),
  paymentNotes: z.string().optional(),
  paymentSubmittedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Order = z.infer<typeof OrderSchema>

export const RespondScheduleProposalRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().trim().max(300).optional(),
})
export type RespondScheduleProposalRequest = z.infer<typeof RespondScheduleProposalRequestSchema>

export const ConfirmReceiptRequestSchema = z.object({
  confirmedWeightKg: z.number().min(0.001).max(100_000).multipleOf(0.001),
  note: z.string().trim().max(300).optional(),
})
export type ConfirmReceiptRequest = z.infer<typeof ConfirmReceiptRequestSchema>

export const CreateOrderRequestSchema = z.object({
  offerId: z.string(),
  quantityKg: z.number().min(0.001).multipleOf(0.001),
  scheduleSlotId: z.string(),
  notes: z.string().optional(),
  contactName: z.string().trim().min(2).optional(),
  contactPhone: z.string().trim().min(8).optional(),
  buyerAddress: OrderBuyerAddressSchema.optional(),
  acceptedPricePerKg: z.number().positive().optional(),
})
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>

export const FarmerProposeScheduleRequestSchema = z.object({
  date: z.iso.date('Pilih tanggal pengambilan yang valid'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam mulai HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam selesai HH:MM'),
  reason: z.string().trim().min(5, 'Tuliskan alasan perubahan jadwal').max(300),
})
export type FarmerProposeScheduleRequest = z.infer<typeof FarmerProposeScheduleRequestSchema>

export const FarmerRestockDecisionRequestSchema = z.object({
  decision: z.enum(['restocked', 'discarded']),
  note: z.string().trim().max(240).optional(),
})
export type FarmerRestockDecisionRequest = z.infer<typeof FarmerRestockDecisionRequestSchema>
