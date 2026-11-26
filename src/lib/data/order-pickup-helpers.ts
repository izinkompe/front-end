import { formatWeightKg } from '@/components/home/offer-card-helpers'
import { formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import type { Order } from '@/types/api/orders'

export const MAX_ACTUAL_WEIGHT_KG = 100_000

export interface WeightDiscrepancyAnalysis {
  differenceKg: number
  absDifferenceKg: number
  hasDiscrepancy: boolean
  isShortage: boolean
  isSurplus: boolean
  estimatedShortageRefund: number
}

export function validateActualWeightKg(weightKg: number | null): string | null {
  if (weightKg === null) {
    return 'Masukkan berat aktual yang diterima dalam satuan kg (maksimal 3 angka di belakang koma).'
  }
  if (!Number.isFinite(weightKg) || weightKg < 0.001) {
    return 'Berat aktual minimal 0,001 kg.'
  }
  if (weightKg > MAX_ACTUAL_WEIGHT_KG) {
    return 'Berat aktual melebihi batas wajar pencatatan (100.000 kg).'
  }
  return null
}

export function analyzeWeightDiscrepancy(
  orderedWeightKg: number,
  actualWeightKg: number,
  pricePerKg = 0
): WeightDiscrepancyAnalysis {
  const differenceKg = Math.round((actualWeightKg - orderedWeightKg) * 1000) / 1000
  const absDifferenceKg = Math.round(Math.abs(differenceKg) * 1000) / 1000
  const isShortage = differenceKg <= -0.001
  const isSurplus = differenceKg >= 0.001
  const hasDiscrepancy = isShortage || isSurplus
  const estimatedShortageRefund =
    isShortage && pricePerKg > 0 ? Math.round(absDifferenceKg * pricePerKg) : 0

  return {
    differenceKg,
    absDifferenceKg,
    hasDiscrepancy,
    isShortage,
    isSurplus,
    estimatedShortageRefund,
  }
}

export function buildPickupMapsHref(latitude: number, longitude: number): string | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }
  const coords = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`
}

export function buildPickupSummaryText(
  order: Pick<
    Order,
    | 'id'
    | 'commodityName'
    | 'quantityKg'
    | 'scheduleSlot'
    | 'farmerName'
    | 'pickupLocation'
    | 'buyerContactName'
    | 'buyerContactPhone'
    | 'buyerOrganization'
  >,
  options?: { includeOrganization?: boolean }
): string {
  const includeOrganization = options?.includeOrganization ?? true
  const lines = [
    'Ringkasan Pengambilan Panen PanganTani',
    `No. Pesanan: ${order.id}`,
    `Komoditas: ${order.commodityName} (${formatWeightKg(order.quantityKg)})`,
    `Jadwal Ambil: ${formatPickupSlotLabel(order.scheduleSlot)}`,
    `Petani: ${order.farmerName || 'Petani mitra PanganTani'}`,
    `Lokasi Kebun: ${order.pickupLocation.address}`,
  ]

  if (order.pickupLocation.notes) {
    lines.push(`Patokan Lokasi: ${order.pickupLocation.notes}`)
  }

  const buyerParts = [
    order.buyerContactName,
    includeOrganization ? order.buyerOrganization : undefined,
    order.buyerContactPhone,
  ].filter(Boolean)

  if (buyerParts.length > 0) {
    lines.push(`Penanggung Jawab: ${buyerParts.join(' - ')}`)
  }

  return lines.join('\n')
}
