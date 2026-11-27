import { z } from 'zod'

export const UserRoleSchema = z.enum(['buyer', 'farmer', 'admin'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const FarmerTypeSchema = z.enum(['individual', 'poktan', 'cooperative'])
export type FarmerType = z.infer<typeof FarmerTypeSchema>

export const CommodityCategorySchema = z.enum([
  'sayuran',
  'buah',
  'padi-biji',
  'rempah-umbi',
  'lainnya',
])
export type CommodityCategory = z.infer<typeof CommodityCategorySchema>

export const FarmerBankAccountSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(2, 'Pilih atau isi nama bank penerima dana')
    .max(60, 'Nama bank maksimal 60 karakter'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{8,20}$/, 'Nomor rekening harus berisi 8 sampai 20 angka tanpa spasi'),
  accountHolderName: z.string().trim().min(3, 'Nama pemilik rekening minimal 3 karakter'),
})
export type FarmerBankAccount = z.infer<typeof FarmerBankAccountSchema>

export const FarmerDocumentMetaSchema = z.object({
  name: z.string().trim().min(1, 'Dokumen wajib diunggah'),
  type: z.enum(['image/jpeg', 'image/png'], {
    message: 'Format foto harus JPG atau PNG',
  }),
  size: z
    .number()
    .positive('Ukuran file tidak valid')
    .max(5 * 1024 * 1024, 'Ukuran foto maksimal 5 MB'),
})
export type FarmerDocumentMeta = z.infer<typeof FarmerDocumentMetaSchema>

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

export const SaveBuyerAddressRequestSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(2, 'Label alamat minimal 2 karakter').max(60),
  areaName: z.string().trim().min(3, 'Isi kecamatan atau kota tujuan minimal 3 karakter').max(120),
  fullAddress: z.string().trim().min(8, 'Alamat lengkap minimal 8 karakter').max(300),
  setAsDefault: z.boolean().optional(),
})
export type SaveBuyerAddressRequest = z.infer<typeof SaveBuyerAddressRequestSchema>

export const ReminderRadiusSchema = z.literal([5, 10, 25, 50])

export const AccountPreferencesSchema = z.object({
  orderStatusUpdates: z.boolean(),
  harvestReminders: z.boolean(),
  reminderRadiusKm: ReminderRadiusSchema.optional(),
  marketingEmails: z.boolean(),
  showOrganizationOnReceipts: z.boolean(),
})
export type AccountPreferences = z.infer<typeof AccountPreferencesSchema>

export const BookmarkListSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(160).optional(),
  offerIds: z.array(z.string()),
  createdAt: z.string(),
})
export type BookmarkList = z.infer<typeof BookmarkListSchema>

export const CreateBookmarkListRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama daftar minimal 2 karakter')
    .max(60, 'Nama daftar maksimal 60 karakter'),
  description: z.string().trim().max(160, 'Catatan maksimal 160 karakter').optional(),
})
export type CreateBookmarkListRequest = z.infer<typeof CreateBookmarkListRequestSchema>

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: UserRoleSchema,
  organization: z.string().optional(),
  addresses: z.array(UserAddressSchema).optional(),
  isEmailVerified: z.boolean().optional(),
  emailVerifiedAt: z.string().nullable().optional(),
  isPhoneVerified: z.boolean().optional(),
  isVerifiedFarmer: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  farmerType: FarmerTypeSchema.optional(),
  primaryCommodities: z.array(CommodityCategorySchema).optional(),
  customCommodity: z.string().optional(),
  bankAccount: FarmerBankAccountSchema.optional(),
  avatarUrl: z.string().optional(),
  preferences: AccountPreferencesSchema.optional(),
  favoriteOfferIds: z.array(z.string()).optional(),
  followedFarmerIds: z.array(z.string()).optional(),
  bookmarkLists: z.array(BookmarkListSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const UpdateProfileRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  phone: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .regex(
          /^(?:\+62|62|0)8\d{7,12}$/,
          'Masukkan nomor WhatsApp aktif yang benar, contoh: 081234567890'
        ),
    ])
    .optional(),
  organization: z
    .string()
    .trim()
    .max(120, 'Nama usaha atau organisasi maksimal 120 karakter')
    .optional(),
  avatarUrl: z.string().trim().max(3000000).nullable().optional(),
  preferences: AccountPreferencesSchema.optional(),
})
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>

export const VerifyPhoneRequestSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+62|62|0)8\d{7,12}$/,
      'Masukkan nomor WhatsApp aktif yang benar, contoh: 081234567890'
    ),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Kode verifikasi harus berisi 6 angka'),
})
export type VerifyPhoneRequest = z.infer<typeof VerifyPhoneRequestSchema>

export const StrongPasswordSchema = z
  .string()
  .min(8, 'Kata sandi minimal 8 karakter agar akun aman')
  .max(128, 'Kata sandi maksimal 128 karakter')
  .regex(/[A-Za-z]/, 'Kata sandi harus mengandung huruf')
  .regex(/\d/, 'Kata sandi harus mengandung angka')

export const LoginRequestSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang benar, contoh: budi@email.com'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const BuyerRegisterRequestSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter'),
    email: z.string().trim().email('Format email tidak valid'),
    password: StrongPasswordSchema,
    password_confirmation: z.string().min(1, 'Ulangi kata sandi Anda').optional(),
    role: UserRoleSchema.default('buyer').optional(),
  })
  .refine(
    (data) =>
      data.password_confirmation === undefined || data.password === data.password_confirmation,
    {
      message: 'Konfirmasi kata sandi tidak cocok',
      path: ['password_confirmation'],
    }
  )
export type BuyerRegisterRequest = z.infer<typeof BuyerRegisterRequestSchema>

export const RegisterRequestSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8).optional(),
    password: StrongPasswordSchema,
    password_confirmation: z.string().min(1),
    role: z.enum(['buyer', 'farmer']).default('buyer'),
    organization: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['password_confirmation'],
  })
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const FarmerStep1Schema = z.object({
  farmerType: FarmerTypeSchema,
  farmName: z
    .string()
    .trim()
    .min(3, 'Nama kebun atau kelompok tani minimal 3 karakter')
    .max(100, 'Nama kebun atau kelompok tani maksimal 100 karakter'),
})
export type FarmerStep1Values = z.infer<typeof FarmerStep1Schema>

export const FarmerStep2Schema = z
  .object({
    primaryCommodities: z
      .array(CommodityCategorySchema)
      .min(1, 'Pilih minimal 1 kategori hasil panen yang Anda tanam'),
    customCommodity: z
      .string()
      .trim()
      .max(80, 'Nama kategori baru maksimal 80 karakter')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.primaryCommodities.includes('lainnya')) {
      const custom = (data.customCommodity ?? '').trim()
      if (custom.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['customCommodity'],
          message: 'Tuliskan nama kategori hasil panen lainnya (minimal 2 karakter)',
        })
      }
    }
  })
export type FarmerStep2Values = z.infer<typeof FarmerStep2Schema>

export const FarmerStep3Schema = z
  .object({
    name: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter'),
    email: z.string().trim().email('Masukkan alamat email yang benar, contoh: pakbudi@email.com'),
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:\+62|62|0)8\d{8,12}$/,
        'Masukkan nomor WhatsApp aktif yang benar, contoh: 081234567890'
      ),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter agar akun aman')
      .regex(/[A-Za-z]/, 'Kata sandi harus mengandung huruf')
      .regex(/\d/, 'Kata sandi harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Ulangi kata sandi Anda'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi yang diulang tidak sama, mohon periksa kembali',
    path: ['confirmPassword'],
  })
export type FarmerStep3Values = z.infer<typeof FarmerStep3Schema>

export const FarmerStep4Schema = z.object({
  provinceId: z.string().trim().min(1, 'Pilih provinsi lokasi kebun Anda'),
  areaName: z.string().trim().min(3, 'Pilih atau isi wilayah kabupaten/kecamatan kebun Anda'),
  fullAddress: z.string().trim().min(10, 'Tulis alamat lengkap lahan minimal 10 karakter'),
  latitude: z.number().min(-11, 'Titik lokasi tidak valid').max(6, 'Titik lokasi tidak valid'),
  longitude: z.number().min(95, 'Titik lokasi tidak valid').max(141, 'Titik lokasi tidak valid'),
  pickupNotes: z
    .string()
    .trim()
    .min(5, 'Tulis patokan atau catatan pengambilan minimal 5 karakter'),
})
export type FarmerStep4Values = z.infer<typeof FarmerStep4Schema>

export const FarmerStep5Schema = FarmerBankAccountSchema
export type FarmerStep5Values = z.infer<typeof FarmerStep5Schema>

export const FarmerStep6Schema = z.object({
  idCardNumber: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'Nomor KTP (NIK) harus berisi tepat 16 angka sesuai kartu KTP Anda'),
  identityDocument: FarmerDocumentMetaSchema,
  farmDocument: FarmerDocumentMetaSchema,
  agreedToTerms: z.literal(true, {
    message: 'Centang persetujuan syarat, privasi, dan kebenaran data untuk melanjutkan',
  }),
})
export type FarmerStep6Values = z.infer<typeof FarmerStep6Schema>

export const FarmerRegisterRequestSchema = z.object({
  farmerType: FarmerTypeSchema,
  primaryCommodities: z.array(CommodityCategorySchema).min(1),
  customCommodity: z.string().trim().max(80).optional(),
  farmName: z.string().trim().min(3).max(100),
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10),
  password: z.string().min(8),
  provinceId: z.string().trim().min(1),
  areaName: z.string().trim().min(3),
  fullAddress: z.string().trim().min(10),
  latitude: z.number(),
  longitude: z.number(),
  pickupNotes: z.string().trim().min(5),
  bankAccount: FarmerBankAccountSchema,
  idCardNumber: z
    .string()
    .trim()
    .regex(/^\d{16}$/),
  identityDocument: FarmerDocumentMetaSchema,
  farmDocument: FarmerDocumentMetaSchema,
  agreedToTerms: z.literal(true),
})
export type FarmerRegisterRequest = z.infer<typeof FarmerRegisterRequestSchema>

export const ForgotPasswordRequestSchema = z.object({ email: z.email().trim().max(254) })
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>

export const ResetPasswordRequestSchema = ForgotPasswordRequestSchema.extend({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/)
    .optional(),
  token: z.string().trim().min(1).optional(),
  password: StrongPasswordSchema,
  password_confirmation: z.string().min(1, 'Ulangi kata sandi Anda').optional(),
}).refine(
  (data) =>
    data.password_confirmation === undefined || data.password === data.password_confirmation,
  {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['password_confirmation'],
  }
)
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>

export const VerifyEmailOtpRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Kode verifikasi harus berisi 6 angka'),
})
export type VerifyEmailOtpRequest = z.infer<typeof VerifyEmailOtpRequestSchema>

export const VerifyEmailUrlRequestSchema = z.object({
  verificationUrl: z.string().url('URL verifikasi tidak valid'),
})
export type VerifyEmailUrlRequest = z.infer<typeof VerifyEmailUrlRequestSchema>

export const UpdateEmailRequestSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang valid'),
  current_password: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
})
export type UpdateEmailRequest = z.infer<typeof UpdateEmailRequestSchema>
