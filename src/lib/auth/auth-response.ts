import { z } from 'zod'
import {
  AccountPreferencesSchema,
  CommodityCategorySchema,
  FarmerBankAccountSchema,
  FarmerTypeSchema,
  UserAddressSchema,
  UserRoleSchema,
  UserSchema,
  type User,
  type UserAddress,
} from '@/types/api/auth'

const BackendAddressSchema = z.object({
  id: z.union([z.string(), z.number()]),
  label: z.string(),
  address: z.string(),
  area: z.string(),
  latitude: z.union([z.number(), z.string()]),
  longitude: z.union([z.number(), z.string()]),
  instructions: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
})

const RawUserObjectSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
    role: UserRoleSchema,
    organization: z.string().nullable().optional(),
    addresses: z.array(z.union([UserAddressSchema, BackendAddressSchema])).optional(),
    isEmailVerified: z.boolean().optional(),
    emailVerifiedAt: z.string().nullable().optional(),
    email_verified_at: z.string().nullable().optional(),
    isPhoneVerified: z.boolean().optional(),
    isVerifiedFarmer: z.boolean().optional(),
    onboardingCompleted: z.boolean().optional(),
    farmerType: FarmerTypeSchema.optional(),
    primaryCommodities: z.array(CommodityCategorySchema).optional(),
    customCommodity: z.string().nullable().optional(),
    bankAccount: FarmerBankAccountSchema.optional(),
    avatarUrl: z.string().nullable().optional(),
    preferences: z.record(z.string(), z.unknown()).nullable().optional(),
    favoriteOfferIds: z.array(z.string()).optional(),
    followedFarmerIds: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    created_at: z.string().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .refine((data) => Boolean(data.createdAt || data.created_at), {
    message: 'Timestamp createdAt atau created_at wajib ada',
  })
  .refine((data) => Boolean(data.updatedAt || data.updated_at), {
    message: 'Timestamp updatedAt atau updated_at wajib ada',
  })

const BackendVerificationSchema = z
  .object({
    status: z.string().optional(),
  })
  .nullable()
  .optional()

function normalizeAddress(
  raw: z.infer<typeof UserAddressSchema> | z.infer<typeof BackendAddressSchema>,
  index: number
): UserAddress {
  if ('fullAddress' in raw) {
    return raw
  }
  return {
    id: String(raw.id),
    label: raw.label,
    fullAddress: raw.address,
    areaName: raw.area,
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    isDefault: raw.isDefault ?? index === 0,
    notes: raw.instructions ?? undefined,
  }
}

function normalizeUserPayload(
  raw: z.infer<typeof RawUserObjectSchema>,
  extraAddresses?: Array<z.infer<typeof UserAddressSchema> | z.infer<typeof BackendAddressSchema>>,
  verification?: z.infer<typeof BackendVerificationSchema>
): User {
  const emailVerifiedAt =
    raw.emailVerifiedAt !== undefined ? raw.emailVerifiedAt : raw.email_verified_at
  const isEmailVerified =
    raw.isEmailVerified !== undefined
      ? raw.isEmailVerified
      : emailVerifiedAt !== undefined
        ? emailVerifiedAt !== null
        : undefined
  const parsedPrefs = AccountPreferencesSchema.safeParse(raw.preferences)
  const rawAddresses = extraAddresses ?? raw.addresses
  const normalizedAddresses = rawAddresses?.map((item, index) => normalizeAddress(item, index))
  const isVerifiedFarmer =
    raw.isVerifiedFarmer !== undefined
      ? raw.isVerifiedFarmer
      : verification?.status === 'approved'
        ? true
        : undefined

  return UserSchema.parse({
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? '',
    role: raw.role,
    organization: raw.organization ?? undefined,
    addresses: normalizedAddresses,
    isEmailVerified,
    emailVerifiedAt: emailVerifiedAt ?? undefined,
    isPhoneVerified: raw.isPhoneVerified,
    isVerifiedFarmer,
    onboardingCompleted: raw.onboardingCompleted,
    farmerType: raw.farmerType,
    primaryCommodities: raw.primaryCommodities,
    customCommodity: raw.customCommodity ?? undefined,
    bankAccount: raw.bankAccount,
    avatarUrl: raw.avatarUrl ?? undefined,
    preferences: parsedPrefs.success ? parsedPrefs.data : undefined,
    favoriteOfferIds: raw.favoriteOfferIds,
    followedFarmerIds: raw.followedFarmerIds,
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
  })
}

const BackendMeEnvelopeSchema = z
  .object({
    user: RawUserObjectSchema,
    addresses: z.array(z.union([UserAddressSchema, BackendAddressSchema])).optional(),
    verification: BackendVerificationSchema,
  })
  .transform((envelope) =>
    normalizeUserPayload(envelope.user, envelope.addresses, envelope.verification)
  )

const DirectUserSchema = RawUserObjectSchema.transform((user) => normalizeUserPayload(user))

export const AuthMeResponseSchema: z.ZodType<User | null> = z
  .union([UserSchema, BackendMeEnvelopeSchema, DirectUserSchema])
  .nullable()

export const AuthSessionResponseSchema: z.ZodType<{ token?: string; user: User }> = z
  .object({
    token: z.string().optional(),
    user: z.union([UserSchema, DirectUserSchema]),
  })
  .transform((payload) => ({
    token: payload.token,
    user: payload.user,
  }))
