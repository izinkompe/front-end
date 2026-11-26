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

export const OrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  farmerId: z.string(),
  farmerName: z.string().optional(),
  offerId: z.string(),
  commodityName: z.string(),
  commodityPhotoUrl: z.string().optional(),
  quantityKg: z.number().positive(),
  pricePerKg: z.number().positive(),
  totalPrice: z.number().positive(),
  scheduleSlot: ScheduleSlotSchema,
  proposedScheduleSlot: ScheduleSlotSchema.optional(),
  paymentDeadline: z.string(),
  status: OrderStatusSchema,
  confirmedWeightKg: z.number().positive().optional(),
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

export const CreateOrderRequestSchema = z.object({
  offerId: z.string(),
  quantityKg: z.number().positive(),
  scheduleSlotId: z.string(),
  notes: z.string().optional(),
  contactName: z.string().trim().min(2).optional(),
  contactPhone: z.string().trim().min(8).optional(),
  buyerAddress: OrderBuyerAddressSchema.optional(),
  acceptedPricePerKg: z.number().positive().optional(),
})
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>
