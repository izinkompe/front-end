import { describe, expect, test } from 'bun:test'
import {
  FarmerStep1Schema,
  FarmerStep2Schema,
  FarmerStep3Schema,
  FarmerStep4Schema,
  FarmerStep5Schema,
  FarmerStep6Schema,
  LoginRequestSchema,
} from './auth'

describe('Farmer auth and 6-step non-skippable onboarding schemas', () => {
  test('validates farmer login credentials', () => {
    expect(
      LoginRequestSchema.safeParse({
        email: 'joko@suburmakmur.id',
        password: 'Password1',
      }).success
    ).toBe(true)

    expect(
      LoginRequestSchema.safeParse({
        email: 'bukan-email',
        password: '123',
      }).success
    ).toBe(false)
  })

  test('requires farmer type and farm name on step 1', () => {
    expect(
      FarmerStep1Schema.safeParse({
        farmerType: 'poktan',
        farmName: 'Kelompok Tani Subur Makmur',
      }).success
    ).toBe(true)

    expect(
      FarmerStep1Schema.safeParse({
        farmerType: 'individual',
        farmName: 'AB',
      }).success
    ).toBe(false)
  })

  test('requires at least 1 commodity and custom input when lainnya is selected on step 2', () => {
    expect(
      FarmerStep2Schema.safeParse({
        primaryCommodities: ['sayuran', 'buah'],
      }).success
    ).toBe(true)

    expect(
      FarmerStep2Schema.safeParse({
        primaryCommodities: [],
      }).success
    ).toBe(false)

    expect(
      FarmerStep2Schema.safeParse({
        primaryCommodities: ['lainnya'],
        customCommodity: '',
      }).success
    ).toBe(false)

    expect(
      FarmerStep2Schema.safeParse({
        primaryCommodities: ['sayuran', 'lainnya'],
        customCommodity: 'Jamur tiram',
      }).success
    ).toBe(true)
  })

  test('validates active phone, strong password, and matching confirmation on step 3', () => {
    expect(
      FarmerStep3Schema.safeParse({
        name: 'Budi Santoso',
        email: 'budi@kebun.id',
        phone: '081234567890',
        password: 'Panen2026',
        confirmPassword: 'Panen2026',
      }).success
    ).toBe(true)

    expect(
      FarmerStep3Schema.safeParse({
        name: 'Budi Santoso',
        email: 'budi@kebun.id',
        phone: '081234567890',
        password: 'Panen2026',
        confirmPassword: 'BedaPassword1',
      }).success
    ).toBe(false)
  })

  test('validates farm location, coordinates, and pickup notes on step 4', () => {
    expect(
      FarmerStep4Schema.safeParse({
        provinceId: 'jawa-barat',
        areaName: 'Bandung Barat (Lembang)',
        fullAddress: 'Jl. Raya Maribaya No. 45, Desa Langensari, Lembang',
        latitude: -6.8167,
        longitude: 107.6167,
        pickupNotes: 'Masuk gang sebelah KUD, harap bawa keranjang sendiri',
      }).success
    ).toBe(true)

    expect(
      FarmerStep4Schema.safeParse({
        provinceId: '',
        areaName: 'AB',
        fullAddress: 'Pendek',
        latitude: -6.8167,
        longitude: 107.6167,
        pickupNotes: 'Ok',
      }).success
    ).toBe(false)
  })

  test('validates manual transfer bank account on step 5', () => {
    expect(
      FarmerStep5Schema.safeParse({
        bankName: 'BRI',
        accountNumber: '123401002345501',
        accountHolderName: 'Budi Santoso',
      }).success
    ).toBe(true)

    expect(
      FarmerStep5Schema.safeParse({
        bankName: 'Bank CIMB Niaga',
        accountNumber: '123401002345501',
        accountHolderName: 'Budi Santoso',
      }).success
    ).toBe(true)

    expect(
      FarmerStep5Schema.safeParse({
        bankName: 'A',
        accountNumber: '123401002345501',
        accountHolderName: 'Budi Santoso',
      }).success
    ).toBe(false)

    expect(
      FarmerStep5Schema.safeParse({
        bankName: 'BRI',
        accountNumber: '1234-abc',
        accountHolderName: 'Budi Santoso',
      }).success
    ).toBe(false)
  })

  test('validates 16-digit NIK, JPG/PNG <= 5MB documents, and mandatory terms on step 6', () => {
    const validDoc = {
      name: 'ktp-budi.jpg',
      type: 'image/jpeg',
      size: 1024 * 500,
    }

    expect(
      FarmerStep6Schema.safeParse({
        idCardNumber: '3217012345678901',
        identityDocument: validDoc,
        farmDocument: { name: 'kebun.png', type: 'image/png', size: 1024 * 800 },
        agreedToTerms: true,
      }).success
    ).toBe(true)

    expect(
      FarmerStep6Schema.safeParse({
        idCardNumber: '3217012345',
        identityDocument: validDoc,
        farmDocument: validDoc,
        agreedToTerms: false,
      }).success
    ).toBe(false)

    expect(
      FarmerStep6Schema.safeParse({
        idCardNumber: '3217012345678901',
        identityDocument: { name: 'ktp.pdf', type: 'application/pdf', size: 1024 * 500 },
        farmDocument: validDoc,
        agreedToTerms: true,
      }).success
    ).toBe(false)

    expect(
      FarmerStep6Schema.safeParse({
        idCardNumber: '3217012345678901',
        identityDocument: { name: 'besar.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 },
        farmDocument: validDoc,
        agreedToTerms: true,
      }).success
    ).toBe(false)
  })
})
