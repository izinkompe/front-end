import type { NeedRequest } from '@/types/api/needs-board'

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

export const mockNeedsBoardData: NeedRequest[] = [
  {
    id: 'need-001',
    buyerId: 'usr-pb-01',
    buyerName: 'Ibu Ratna',
    organization: 'Dapur Umum Yayasan Kasih',
    commodityName: 'Beras Medium atau Ramos',
    category: 'Padi & Biji-bijian',
    neededQuantityKg: 250,
    maxPricePerKg: 13000,
    targetDate: getRelativeDateIso(2),
    targetArea: 'Coblong, Bandung',
    notes: 'Kebutuhan distribusi paket makan siang dapur umum mingguan.',
    status: 'partially_fulfilled',
    responses: [
      {
        id: 'resp-001',
        farmerId: 'usr-pt-05',
        farmerName: 'Pak Hendra (Lumbung Cianjur)',
        offerId: 'off-010',
        offeredQuantityKg: 180,
        offeredPricePerKg: 12200,
        availableDate: getRelativeDateIso(1),
        message: 'Ada stok beras surplus gilingan minggu ini siap diambil di lumbung.',
        createdAt: getRelativeTimestamp(-6 * HOUR_MS),
      },
    ],
    createdAt: getRelativeTimestamp(-18 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-6 * HOUR_MS),
  },
  {
    id: 'need-002',
    buyerId: 'usr-pb-02',
    buyerName: 'Chef Dimas',
    organization: 'Katering Dapur Nusantara',
    commodityName: 'Tomat & Wortel Layak Olah',
    category: 'Sayuran',
    neededQuantityKg: 120,
    maxPricePerKg: 11500,
    targetDate: getRelativeDateIso(1),
    targetArea: 'Sukajadi, Bandung',
    notes: 'Bentuk tidak seragam atau grade B diterima untuk bahan dasar saus dan sup.',
    status: 'partially_fulfilled',
    responses: [
      {
        id: 'resp-002',
        farmerId: 'usr-pt-01',
        farmerName: 'Pak Joko (Kelompok Tani Subur Makmur)',
        offerId: 'off-001',
        offeredQuantityKg: 60,
        offeredPricePerKg: 11000,
        availableDate: getRelativeDateIso(1),
        message: 'Siap pasok tomat ceri grade B untuk pengambilan pagi di Lembang.',
        createdAt: getRelativeTimestamp(-4 * HOUR_MS),
      },
    ],
    createdAt: getRelativeTimestamp(-14 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-4 * HOUR_MS),
  },
  {
    id: 'need-003',
    buyerId: 'usr-pb-03',
    buyerName: 'Ibu Lestari',
    organization: 'Panti Asuhan Harapan Mulia',
    commodityName: 'Pisang atau Pepaya Matang',
    category: 'Buah',
    neededQuantityKg: 80,
    maxPricePerKg: 10000,
    targetDate: getRelativeDateIso(2),
    targetArea: 'Cimahi Tengah',
    notes: 'Untuk konsumsi buah harian anak panti, siap ambil mandiri dengan mobil bak.',
    status: 'open',
    responses: [],
    createdAt: getRelativeTimestamp(-9 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-9 * HOUR_MS),
  },
  {
    id: 'need-004',
    buyerId: 'usr-pb-04',
    buyerName: 'Pak Hendri',
    organization: 'Rumah Makan Bumbu Desa',
    commodityName: 'Bawang Merah & Kentang Campur',
    category: 'Rempah & Umbi',
    neededQuantityKg: 150,
    maxPricePerKg: 21000,
    targetDate: getRelativeDateIso(3),
    targetArea: 'Buahbatu, Bandung',
    notes: 'Ukuran kecil atau campur untuk stok bumbu giling mingguan.',
    status: 'partially_fulfilled',
    responses: [
      {
        id: 'resp-003',
        farmerId: 'usr-pt-02',
        farmerName: 'Bu Sumarni (Tani Barokah Pangalengan)',
        offerId: 'off-014',
        offeredQuantityKg: 90,
        offeredPricePerKg: 10500,
        availableDate: getRelativeDateIso(1),
        message: 'Tersedia kentang granola ukuran kecil siap ambil di Pangalengan.',
        createdAt: getRelativeTimestamp(-3 * HOUR_MS),
      },
    ],
    createdAt: getRelativeTimestamp(-12 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-3 * HOUR_MS),
  },
]
