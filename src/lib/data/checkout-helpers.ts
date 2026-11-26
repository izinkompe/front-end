import type { Order, OrderStatus } from '@/types/api/orders'

export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024

export const ALLOWED_PAYMENT_PROOF_TYPES = ['image/jpeg', 'image/png'] as const

export interface PaymentProofFileInput {
  name: string
  type: string
  size: number
}

export interface CheckoutQueryState {
  offerId: string
  quantityText: string
  slotId: string
  notes: string
  expectedPricePerKg: number | null
}

export interface CheckoutContactErrors {
  contactName?: string
  contactPhone?: string
}

export interface PaymentCountdownState {
  isExpired: boolean
  remainingMs: number
  label: string
  isUrgent: boolean
}

const DEFAULT_BANK_ACCOUNT = {
  bankName: 'BRI',
  accountNumber: '123401002345501',
  accountHolderName: 'Rekening Penampungan PanganTani',
}

export function validatePaymentProofFile(file: PaymentProofFileInput | null): string | null {
  if (!file) {
    return 'Pilih foto bukti transfer berformat JPG atau PNG.'
  }

  if (!ALLOWED_PAYMENT_PROOF_TYPES.includes(file.type as 'image/jpeg' | 'image/png')) {
    return 'Format file harus JPG atau PNG.'
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return 'Ukuran file bukti transfer tidak valid.'
  }

  if (file.size > MAX_PAYMENT_PROOF_BYTES) {
    return 'Ukuran file maksimal 5 MB.'
  }

  return null
}

export function validateCheckoutContact(input: {
  contactName: string
  contactPhone: string
}): CheckoutContactErrors {
  const errors: CheckoutContactErrors = {}
  const trimmedName = input.contactName.trim()
  const normalizedPhone = input.contactPhone.trim().replace(/[\s-]/g, '')

  if (trimmedName.length < 2) {
    errors.contactName = 'Masukkan nama penanggung jawab pengambilan minimal 2 karakter.'
  }

  if (!/^(?:\+62|62|0)8\d{7,12}$/.test(normalizedPhone)) {
    errors.contactPhone = 'Masukkan nomor telepon atau WhatsApp aktif, contoh: 081234567890.'
  }

  return errors
}

function getFirstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }
  return value ?? ''
}

export function parseCheckoutSearchParams(
  params: Record<string, string | string[] | undefined>
): CheckoutQueryState {
  const offerId = getFirstParam(params.offerId).trim()
  const rawQty = getFirstParam(params.qty).trim().replace(',', '.')
  const quantityText = /^\d+(?:\.\d{1,3})?$/.test(rawQty) ? rawQty : ''
  const slotId = getFirstParam(params.slotId).trim()
  const notes = getFirstParam(params.notes).trim().slice(0, 300)
  const rawPrice = Number(getFirstParam(params.price).trim())
  const expectedPricePerKg = Number.isFinite(rawPrice) && rawPrice > 0 ? Math.round(rawPrice) : null

  return {
    offerId,
    quantityText,
    slotId,
    notes,
    expectedPricePerKg,
  }
}

export function buildCheckoutHref(options: {
  offerId: string
  quantityKg?: number | null
  slotId?: string
  notes?: string
  pricePerKg?: number
}): string {
  const search = new URLSearchParams()
  search.set('offerId', options.offerId)

  if (
    typeof options.quantityKg === 'number' &&
    Number.isFinite(options.quantityKg) &&
    options.quantityKg > 0
  ) {
    search.set('qty', String(options.quantityKg))
  }
  if (options.slotId) {
    search.set('slotId', options.slotId)
  }
  if (options.notes?.trim()) {
    search.set('notes', options.notes.trim().slice(0, 300))
  }
  if (
    typeof options.pricePerKg === 'number' &&
    Number.isFinite(options.pricePerKg) &&
    options.pricePerKg > 0
  ) {
    search.set('price', String(Math.round(options.pricePerKg)))
  }

  return `/pasar/checkout?${search.toString()}`
}

export function hasOfferPriceChanged(
  expectedPricePerKg: number | null,
  currentPricePerKg: number
): boolean {
  if (expectedPricePerKg === null) return false
  return Math.round(expectedPricePerKg) !== Math.round(currentPricePerKg)
}

export function getPaymentCountdownState(
  paymentDeadlineIso: string,
  nowMs: number
): PaymentCountdownState {
  const deadlineMs = Date.parse(paymentDeadlineIso)
  if (!Number.isFinite(deadlineMs)) {
    return {
      isExpired: false,
      remainingMs: 0,
      label: 'Tenggat aktif',
      isUrgent: false,
    }
  }

  const remainingMs = Math.max(0, deadlineMs - nowMs)
  if (remainingMs === 0) {
    return {
      isExpired: true,
      remainingMs: 0,
      label: 'Waktu habis',
      isUrgent: true,
    }
  }

  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const label =
    hours > 0
      ? `${hours} jam ${String(minutes).padStart(2, '0')} menit`
      : `${minutes} menit ${String(seconds).padStart(2, '0')} detik`

  return {
    isExpired: false,
    remainingMs,
    label,
    isUrgent: remainingMs <= 10 * 60 * 1000,
  }
}

export function formatOrderStatusLabel(status: OrderStatus, rejectionReason?: string): string {
  if (status === 'pending_payment') {
    return rejectionReason ? 'Perlu unggah ulang bukti' : 'Menunggu pembayaran'
  }
  if (status === 'payment_submitted') return 'Menunggu verifikasi'
  if (status === 'processing') return 'Pembayaran disetujui'
  if (status === 'ready_for_pickup') return 'Siap diambil'
  if (status === 'completed') return 'Selesai'
  if (status === 'cancelled') return 'Dibatalkan'
  return 'Dalam peninjauan'
}

export function getOrderBankAccount(order: Pick<Order, 'bankAccount' | 'farmerName'>): {
  bankName: string
  accountNumber: string
  accountHolderName: string
} {
  if (order.bankAccount) {
    return order.bankAccount
  }
  return {
    ...DEFAULT_BANK_ACCOUNT,
    accountHolderName: order.farmerName || DEFAULT_BANK_ACCOUNT.accountHolderName,
  }
}

export function isSafeProofImageUrl(candidate?: string): string | null {
  if (!candidate) return null
  const trimmed = candidate.trim()
  if (!trimmed) return null

  if (/^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith('blob:')) {
    return trimmed
  }
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g)$/.test(trimmed)) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    return null
  }

  return null
}

export interface BuyerAddressErrors {
  label?: string
  areaName?: string
  fullAddress?: string
}

export interface OrderTimelineStep {
  id: string
  label: string
  timestamp?: string
  state: 'completed' | 'current' | 'cancelled' | 'upcoming'
}

export function validateBuyerAddress(input: {
  label: string
  areaName: string
  fullAddress: string
}): BuyerAddressErrors {
  const errors: BuyerAddressErrors = {}

  if (input.label.trim().length < 2) {
    errors.label = 'Label alamat minimal 2 karakter, contoh: Dapur Utama.'
  }
  if (input.areaName.trim().length < 3) {
    errors.areaName = 'Isi kecamatan atau kota tujuan minimal 3 karakter.'
  }
  if (input.fullAddress.trim().length < 8) {
    errors.fullAddress = 'Tulis alamat lengkap minimal 8 karakter.'
  }

  return errors
}

export function buildOrderTimelineSteps(
  order: Pick<
    Order,
    | 'status'
    | 'createdAt'
    | 'paymentSubmittedAt'
    | 'updatedAt'
    | 'rejectionReason'
    | 'receiptConfirmedAt'
  >
): OrderTimelineStep[] {
  if (order.status === 'cancelled') {
    const steps: OrderTimelineStep[] = [
      {
        id: 'created',
        label: 'Pesanan dibuat',
        timestamp: order.createdAt,
        state: 'completed',
      },
    ]

    if (order.paymentSubmittedAt) {
      steps.push({
        id: 'payment_submitted',
        label: 'Bukti transfer dikirim',
        timestamp: order.paymentSubmittedAt,
        state: 'completed',
      })
    }

    steps.push({
      id: 'cancelled',
      label: 'Dibatalkan',
      timestamp: order.updatedAt,
      state: 'cancelled',
    })

    return steps
  }

  if (order.status === 'disputed') {
    return [
      {
        id: 'created',
        label: 'Pesanan dibuat',
        timestamp: order.createdAt,
        state: 'completed',
      },
      {
        id: 'payment',
        label: order.paymentSubmittedAt ? 'Pembayaran diverifikasi' : 'Verifikasi pembayaran',
        timestamp: order.paymentSubmittedAt,
        state: 'completed',
      },
      {
        id: 'pickup',
        label: 'Serah terima panen',
        timestamp: order.receiptConfirmedAt ?? order.updatedAt,
        state: 'completed',
      },
      {
        id: 'disputed',
        label: 'Penanganan selisih berat atau kendala',
        timestamp: order.updatedAt,
        state: 'current',
      },
    ]
  }

  const isPaymentSubmitted =
    order.status === 'payment_submitted' ||
    order.status === 'processing' ||
    order.status === 'ready_for_pickup' ||
    order.status === 'completed'
  const isApproved =
    order.status === 'processing' ||
    order.status === 'ready_for_pickup' ||
    order.status === 'completed'
  const isReady = order.status === 'ready_for_pickup' || order.status === 'completed'
  const isCompleted = order.status === 'completed'

  return [
    {
      id: 'created',
      label: 'Pesanan dibuat',
      timestamp: order.createdAt,
      state: 'completed',
    },
    {
      id: 'payment',
      label:
        order.status === 'pending_payment'
          ? order.rejectionReason
            ? 'Menunggu unggah ulang bukti'
            : 'Menunggu transfer manual'
          : order.status === 'payment_submitted'
            ? 'Menunggu verifikasi admin'
            : 'Pembayaran diverifikasi',
      timestamp: order.paymentSubmittedAt,
      state: isApproved
        ? 'completed'
        : isPaymentSubmitted || order.status === 'pending_payment'
          ? 'current'
          : 'upcoming',
    },
    {
      id: 'pickup',
      label: isReady ? 'Siap diambil di lokasi petani' : 'Penyiapan panen',
      timestamp: isReady ? order.updatedAt : undefined,
      state: isCompleted ? 'completed' : isReady ? 'current' : 'upcoming',
    },
    {
      id: 'completed',
      label: 'Selesai diterima',
      timestamp: isCompleted ? (order.receiptConfirmedAt ?? order.updatedAt) : undefined,
      state: isCompleted ? 'completed' : 'upcoming',
    },
  ]
}
