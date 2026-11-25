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
  bankName: z.string().trim().min(2, 'Pilih nama bank penerima dana'),
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

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: UserRoleSchema,
  organization: z.string().optional(),
  addresses: z.array(UserAddressSchema).optional(),
  isVerifiedFarmer: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  farmerType: FarmerTypeSchema.optional(),
  primaryCommodities: z.array(CommodityCategorySchema).optional(),
  customCommodity: z.string().optional(),
  bankAccount: FarmerBankAccountSchema.optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const LoginRequestSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang benar, contoh: budi@email.com'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const BuyerRegisterRequestSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter'),
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})
export type BuyerRegisterRequest = z.infer<typeof BuyerRegisterRequestSchema>

export const RegisterRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  role: z.enum(['buyer', 'farmer']),
  organization: z.string().optional(),
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
