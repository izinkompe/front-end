import type { CommodityCategory, FarmerType } from '@/types/api/auth'

export function getFieldErrorMessages(errors: unknown[]): Array<{ message: string }> {
  return errors
    .map((error) => {
      if (typeof error === 'string') return { message: error }
      if (error && typeof error === 'object' && 'message' in error) {
        return { message: String((error as { message?: unknown }).message) }
      }
      return undefined
    })
    .filter((item): item is { message: string } => Boolean(item?.message))
}

export interface FarmerTypeOption {
  value: FarmerType
  title: string
  description: string
  badgeLabel: string
}

export const farmerTypeOptions: FarmerTypeOption[] = [
  {
    value: 'individual',
    title: 'Petani Mandiri',
    description: 'Saya menanam dan menjual hasil panen dari kebun atau sawah milik sendiri.',
    badgeLabel: 'Perorangan',
  },
  {
    value: 'poktan',
    title: 'Kelompok Tani',
    description: 'Saya mewakili gabungan beberapa petani dalam satu desa atau wilayah.',
    badgeLabel: 'Kelompok',
  },
  {
    value: 'cooperative',
    title: 'Koperasi / Lumbung',
    description: 'Saya mengelola pasokan hasil panen bersama dalam skala lebih besar.',
    badgeLabel: 'Kolektif',
  },
]

export interface CommodityOption {
  value: CommodityCategory
  label: string
  examples: string
  imageUrl: string
  imageAlt: string
}

export const commodityOptions: CommodityOption[] = [
  {
    value: 'sayuran',
    label: 'Sayuran',
    examples: 'Cabai, tomat, kol, sawi, buncis',
    imageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Aneka sayuran segar hasil panen',
  },
  {
    value: 'buah',
    label: 'Buah-buahan',
    examples: 'Pisang, pepaya, jeruk, alpukat',
    imageUrl:
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Aneka buah-buahan segar hasil kebun',
  },
  {
    value: 'padi-biji',
    label: 'Padi & Biji-bijian',
    examples: 'Beras, jagung, kacang tanah',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Beras dan biji-bijian hasil panen',
  },
  {
    value: 'rempah-umbi',
    label: 'Rempah & Umbi',
    examples: 'Kentang, singkong, jahe, bawang',
    imageUrl:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Rempah-rempah dan umbi-umbian segar',
  },
  {
    value: 'lainnya',
    label: 'Lainnya',
    examples: 'Jamur, madu, telur, atau hasil tani lainnya',
    imageUrl:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Keranjang aneka hasil panen pertanian lainnya',
  },
]

export const OTHER_BANK_VALUE = 'OTHER'

export const bankOptions = [
  { value: 'BRI', label: 'Bank BRI' },
  { value: 'BNI', label: 'Bank BNI' },
  { value: 'Mandiri', label: 'Bank Mandiri' },
  { value: 'BCA', label: 'Bank BCA' },
  { value: 'BSI', label: 'Bank Syariah Indonesia (BSI)' },
  { value: 'BPD', label: 'Bank Daerah (BPD / Bank BJB / Bank Jateng / Bank Jatim)' },
  { value: OTHER_BANK_VALUE, label: 'Lainnya (Others)' },
] as const

const presetBankValues = new Set<string>(
  bankOptions.map((option) => option.value).filter((value) => value !== OTHER_BANK_VALUE)
)

export function isPresetBankName(bankName: string): boolean {
  return presetBankValues.has(bankName.trim())
}

export function isCustomBankName(bankName: string): boolean {
  const trimmed = bankName.trim()
  return trimmed.length > 0 && !isPresetBankName(trimmed)
}

export function getBankOptionLabel(value: string): string {
  return bankOptions.find((option) => option.value === value)?.label ?? value
}

export function formatBankNameInput(value: string): string {
  return value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ')
}

export function normalizeBankName(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export const ONBOARDING_TOTAL_STEPS = 6
export const ONBOARDING_STORAGE_KEY = 'pangantani.farmer.onboarding.v2'
