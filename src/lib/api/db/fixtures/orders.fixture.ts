import type { Order } from '@/types/api/orders'

function getRelativeTimestamp(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString()
}

function getRelativeDateIso(dayOffset: number): string {
  const target = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000)
  const year = target.getFullYear()
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const day = String(target.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const HOUR_MS = 60 * 60 * 1000
const todayDate = getRelativeDateIso(0)
const tomorrowDate = getRelativeDateIso(1)

export const mockOrdersData: Order[] = [
  {
    id: 'ord-demo-001',
    buyerId: 'usr-pb-01',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko (Kelompok Tani Subur Makmur)',
    offerId: 'off-001',
    commodityName: 'Tomat Ceri Hidroponik',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80',
    quantityKg: 15,
    pricePerKg: 14000,
    totalPrice: 210000,
    scheduleSlot: {
      id: 'slot-1',
      date: todayDate,
      startTime: '15:00',
      endTime: '17:00',
      isAvailable: true,
    },
    paymentDeadline: getRelativeTimestamp(-2 * HOUR_MS),
    status: 'ready_for_pickup',
    pickupLocation: {
      address: 'Jl. Raya Maribaya No. 45, Lembang, Bandung Barat',
      latitude: -6.8167,
      longitude: 107.6167,
      notes: 'Masuk gang sebelah KUD Lembang, harap bawa keranjang sendiri',
    },
    buyerContactName: 'Ibu Ratna',
    buyerContactPhone: '081234567890',
    buyerOrganization: 'Dapur Umum Yayasan Kasih',
    buyerAddress: {
      label: 'Dapur Utama',
      fullAddress: 'Jl. Babakan Siliwangi No. 12, Coblong, Bandung',
      areaName: 'Coblong, Bandung',
    },
    bankAccount: {
      bankName: 'BRI',
      accountNumber: '123401002345501',
      accountHolderName: 'Joko Susilo',
    },
    paymentProofUrl: 'data:image/png;base64,iVBORw0KGgo=',
    paymentNotes: 'Transfer atas nama Yayasan Kasih via BRI',
    paymentSubmittedAt: getRelativeTimestamp(-3 * HOUR_MS),
    createdAt: getRelativeTimestamp(-4 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-1 * HOUR_MS),
  },
  {
    id: 'ord-demo-002',
    buyerId: 'usr-pb-01',
    farmerId: 'usr-pt-02',
    farmerName: 'Bu Sumarni (Tani Barokah Pangalengan)',
    offerId: 'off-007',
    commodityName: 'Kol Hijau & Sawi Putih Panen Raya',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=640&q=80',
    quantityKg: 25,
    pricePerKg: 5500,
    totalPrice: 137500,
    scheduleSlot: {
      id: 'slot-8',
      date: tomorrowDate,
      startTime: '07:00',
      endTime: '11:00',
      isAvailable: true,
    },
    proposedScheduleSlot: {
      id: 'slot-8b',
      date: tomorrowDate,
      startTime: '13:00',
      endTime: '16:00',
      isAvailable: true,
    },
    scheduleProposalStatus: 'pending',
    scheduleProposalNote: 'Sortir panen blok utara baru selesai pukul 11.30 WIB karena hujan pagi.',
    paymentDeadline: getRelativeTimestamp(-1 * HOUR_MS),
    status: 'processing',
    pickupLocation: {
      address: 'Blok Pasir Pogor, Margamukti, Pangalengan, Kab. Bandung',
      latitude: -7.1667,
      longitude: 107.5667,
      notes: 'Pengambilan di teras gudang sortir, timbangan digital tersedia di lokasi',
    },
    buyerContactName: 'Ibu Ratna',
    buyerContactPhone: '081234567890',
    buyerOrganization: 'Dapur Umum Yayasan Kasih',
    buyerAddress: {
      label: 'Dapur Utama',
      fullAddress: 'Jl. Babakan Siliwangi No. 12, Coblong, Bandung',
      areaName: 'Coblong, Bandung',
    },
    bankAccount: {
      bankName: 'Mandiri',
      accountNumber: '1300012345678',
      accountHolderName: 'Sumarni',
    },
    paymentProofUrl: 'data:image/png;base64,iVBORw0KGgo=',
    paymentSubmittedAt: getRelativeTimestamp(-2 * HOUR_MS),
    createdAt: getRelativeTimestamp(-3 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-30 * 60 * 1000),
  },
  {
    id: 'ord-demo-003',
    buyerId: 'usr-pb-01',
    farmerId: 'usr-pt-05',
    farmerName: 'Pak Hendra (Lumbung Cianjur)',
    offerId: 'off-010',
    commodityName: 'Beras Medium Gilingan Baru',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80',
    quantityKg: 50,
    confirmedWeightKg: 50,
    pricePerKg: 12200,
    totalPrice: 610000,
    scheduleSlot: {
      id: 'slot-11',
      date: todayDate,
      startTime: '08:00',
      endTime: '15:00',
      isAvailable: true,
    },
    paymentDeadline: getRelativeTimestamp(-20 * HOUR_MS),
    status: 'completed',
    receiptConfirmedAt: getRelativeTimestamp(-6 * HOUR_MS),
    pickupLocation: {
      address: 'Desa Sindanglaya RT 03/01, Cipanas, Cianjur',
      latitude: -6.8168,
      longitude: 107.1425,
      notes: 'Gudang beras kelompok tani dekat balai desa',
    },
    buyerContactName: 'Ibu Ratna',
    buyerContactPhone: '081234567890',
    buyerOrganization: 'Dapur Umum Yayasan Kasih',
    buyerAddress: {
      label: 'Dapur Utama',
      fullAddress: 'Jl. Babakan Siliwangi No. 12, Coblong, Bandung',
      areaName: 'Coblong, Bandung',
    },
    bankAccount: {
      bankName: 'BRI',
      accountNumber: '123401002345501',
      accountHolderName: 'Hendra Wijaya',
    },
    paymentProofUrl: 'data:image/png;base64,iVBORw0KGgo=',
    paymentSubmittedAt: getRelativeTimestamp(-22 * HOUR_MS),
    createdAt: getRelativeTimestamp(-24 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-6 * HOUR_MS),
  },
]

mockOrdersData.push({
  ...mockOrdersData[2],
  id: 'ord-demo-004',
  status: 'disputed',
  confirmedWeightKg: 48,
  weightDiscrepancyNote: 'Berat saat pengambilan berselisih 2 kg.',
})

mockOrdersData.push({
  ...mockOrdersData[1],
  id: 'ord-demo-005',
  quantityKg: 5,
  totalPrice: 27_500,
  status: 'pending_payment',
  proposedScheduleSlot: undefined,
  scheduleProposalStatus: undefined,
  scheduleProposalNote: undefined,
  paymentProofUrl: undefined,
  paymentSubmittedAt: undefined,
  paymentDeadline: getRelativeTimestamp(25 * 60 * 1000),
  createdAt: getRelativeTimestamp(-5 * 60 * 1000),
  updatedAt: getRelativeTimestamp(-5 * 60 * 1000),
})

mockOrdersData.push({
  ...mockOrdersData[0],
  id: 'ord-demo-006',
  offerId: 'off-003',
  commodityName: 'Mangga Harum Manis Matang Pohon',
  quantityKg: 10,
  pricePerKg: 12500,
  totalPrice: 125000,
  scheduleSlot: {
    id: 'slot-4',
    date: todayDate,
    startTime: '13:00',
    endTime: '16:00',
    isAvailable: true,
  },
  status: 'processing',
  paymentDeadline: getRelativeTimestamp(-1 * HOUR_MS),
  createdAt: getRelativeTimestamp(-3 * HOUR_MS),
  updatedAt: getRelativeTimestamp(-30 * 60 * 1000),
})

mockOrdersData.push({
  ...mockOrdersData[0],
  id: 'ord-demo-007',
  offerId: 'off-001',
  commodityName: 'Tomat Ceri Hidroponik',
  quantityKg: 8,
  pricePerKg: 14000,
  totalPrice: 112000,
  status: 'cancelled',
  paymentProofUrl: undefined,
  paymentNotes: undefined,
  paymentSubmittedAt: undefined,
  createdAt: getRelativeTimestamp(-8 * HOUR_MS),
  updatedAt: getRelativeTimestamp(-2 * HOUR_MS),
})

mockOrdersData.push({
  ...mockOrdersData[0],
  id: 'ord-demo-008',
  offerId: 'off-001',
  commodityName: 'Tomat Ceri Hidroponik',
  quantityKg: 20,
  confirmedWeightKg: 18.5,
  pricePerKg: 14000,
  totalPrice: 280000,
  status: 'disputed',
  weightDiscrepancyNote:
    'Berat diterima 18,5 kg dari pesanan 20 kg saat serah terima di pos sortir.',
  receiptConfirmedAt: getRelativeTimestamp(-3 * HOUR_MS),
  createdAt: getRelativeTimestamp(-12 * HOUR_MS),
  updatedAt: getRelativeTimestamp(-2 * HOUR_MS),
})
