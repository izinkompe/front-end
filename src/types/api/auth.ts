import { z } from 'zod'

export const UserRoleSchema = z.enum(['buyer', 'farmer', 'admin'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const UserAddressSchema = z.object({
  id: z.string(),
  label: z.string(),
  fullAddress: z.string(),
  areaName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean(),
  notes: z.string().optional(),
})
export type UserAddress = z.infer<typeof UserAddressSchema>

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: UserRoleSchema,
  organization: z.string().optional(),
  addresses: z.array(UserAddressSchema).optional(),
  isVerifiedFarmer: z.boolean().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const RegisterRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  role: z.enum(['buyer', 'farmer']),
  organization: z.string().optional(),
})
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
