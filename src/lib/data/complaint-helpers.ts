import {
  ALLOWED_PAYMENT_PROOF_TYPES,
  MAX_PAYMENT_PROOF_BYTES,
  validatePaymentProofFile,
} from './checkout-helpers'
import type { ComplaintStatus, ComplaintType } from '@/types/api/complaints'
import type { OrderStatus } from '@/types/api/orders'

export const complaintTypeLabels = {
  weight_discrepancy: 'Selisih berat',
  quality_issue: 'Kendala kualitas',
  pickup_failure: 'Gagal ambil',
  cancellation_request: 'Pembatalan pesanan',
  other: 'Masalah lain',
} satisfies Record<ComplaintType, string>

export const complaintStatusLabels = {
  open: 'Laporan diterima',
  in_investigation: 'Sedang ditinjau',
  resolved: 'Selesai ditangani',
  closed: 'Ditutup',
} satisfies Record<ComplaintStatus, string>

export const refundStatusLabels = {
  not_required: 'Tidak diperlukan',
  pending_transfer: 'Menunggu transfer',
  transferred: 'Sudah ditransfer',
}

export const complaintPhotoAccept = ALLOWED_PAYMENT_PROOF_TYPES.join(',')
export const maxComplaintPhotos = 3

export function validateComplaintFiles(files: File[]) {
  if (files.length > maxComplaintPhotos) {
    return 'Pilih maksimal 3 foto bukti.'
  }
  for (const file of files) {
    const error = validatePaymentProofFile(file)
    if (error) return error
  }
  return null
}

export function validateComplaintDescription(value: string, isCancellation: boolean) {
  const trimmed = value.trim()
  if (trimmed.length < 5) {
    return isCancellation
      ? 'Tuliskan alasan pembatalan minimal 5 karakter.'
      : 'Tuliskan kronologi masalah minimal 5 karakter.'
  }
  if (trimmed.length > 2000) {
    return 'Keterangan maksimal 2.000 karakter.'
  }
  return null
}

export function validateRefundBankField(
  field: 'bankName' | 'accountNumber' | 'accountHolderName',
  value: string
) {
  const trimmed = value.trim()
  if (field === 'bankName') {
    if (trimmed.length < 2) return 'Nama bank minimal 2 karakter.'
    if (trimmed.length > 60) return 'Nama bank maksimal 60 karakter.'
    return null
  }
  if (field === 'accountNumber') {
    if (!/^\d{5,24}$/.test(trimmed)) {
      return 'Nomor rekening harus berisi 5 sampai 24 digit angka.'
    }
    return null
  }
  if (trimmed.length < 2) return 'Nama pemilik rekening minimal 2 karakter.'
  if (trimmed.length > 120) return 'Nama pemilik rekening maksimal 120 karakter.'
  return null
}

export function isPostPaymentCancelable(status: OrderStatus) {
  return status === 'payment_submitted' || status === 'processing' || status === 'ready_for_pickup'
}

export function canReportOrder(status: OrderStatus) {
  return isPostPaymentCancelable(status) || status === 'disputed' || status === 'completed'
}

export function isComplaintPhoto(value: string) {
  if (value.length > Math.ceil(MAX_PAYMENT_PROOF_BYTES / 3) * 4 + 23) return false
  const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match) return false
  const [, type, encoded] = match
  if (
    encoded.length % 4 !== 0 ||
    (encoded.length / 4) * 3 - (encoded.match(/=+$/)?.[0].length ?? 0) > MAX_PAYMENT_PROOF_BYTES
  )
    return false
  return type === 'png' ? encoded.startsWith('iVBORw0KGgo') : encoded.startsWith('/9j/')
}

export async function readComplaintPhotos(files: File[]) {
  if (files.length > maxComplaintPhotos) throw new Error('Pilih maksimal 3 foto.')
  return Promise.all(
    files
      .filter((file) => file.size || file.name)
      .map((file) => {
        const error = validatePaymentProofFile(file)
        if (error) throw new Error(error)
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = String(reader.result)
            if (isComplaintPhoto(result)) resolve(result)
            else reject(new Error('Pilih file foto JPEG atau PNG yang valid.'))
          }
          reader.onerror = () => reject(new Error('Foto gagal dibaca. Pilih ulang file.'))
          reader.readAsDataURL(file)
        })
      })
  )
}
