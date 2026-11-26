import type { Offer } from '@/types/api/offers'
import { regularCatalogOffersData } from './offers-catalog.fixture'

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
const MINUTE_MS = 60 * 1000

const todayDate = getRelativeDateIso(0)
const tomorrowDate = getRelativeDateIso(1)

const urgentOffersData: Offer[] = [
  {
    id: 'off-003',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko (Kelompok Tani Subur Makmur)',
    commodityName: 'Mangga Harum Manis Matang Pohon',
    category: 'Buah',
    condition: 'ripe_urgent',
    surplusReason:
      'Kematangan pohon sudah 95 persen, cocok segera diolah jadi jus atau sambal buah',
    harvestDate: getRelativeTimestamp(-14 * HOUR_MS),
    availableStockKg: 30,
    reservedStockKg: 10,
    soldStockKg: 60,
    pricePerKg: 12500,
    dynamicPriceRule: {
      startPrice: 15500,
      minPrice: 10500,
      dropIntervalHours: 3,
      dropAmount: 1500,
    },
    orderDeadline: getRelativeTimestamp(1 * HOUR_MS + 35 * MINUTE_MS),
    pickupAddressArea: 'Lembang, Bandung Barat',
    pickupAddressFull: 'Jl. Raya Maribaya No. 45, Lembang',
    latitude: -6.8167,
    longitude: 107.6167,
    pickupScheduleSlots: [
      { id: 'slot-4', date: todayDate, startTime: '13:00', endTime: '16:00', isAvailable: true },
      { id: 'slot-4b', date: todayDate, startTime: '16:30', endTime: '18:00', isAvailable: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=80',
    ],
    status: 'active',
    createdAt: getRelativeTimestamp(-12 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-2 * HOUR_MS),
  },
  {
    id: 'off-001',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko (Kelompok Tani Subur Makmur)',
    commodityName: 'Tomat Ceri Hidroponik',
    category: 'Sayuran',
    condition: 'grade_b',
    surplusReason: 'Bentuk sedikit tidak simetris namun rasa dan tingkat kematangan optimal',
    harvestDate: getRelativeTimestamp(-10 * HOUR_MS),
    availableStockKg: 85,
    reservedStockKg: 15,
    soldStockKg: 100,
    pricePerKg: 14000,
    dynamicPriceRule: {
      startPrice: 16000,
      minPrice: 12000,
      dropIntervalHours: 6,
      dropAmount: 1000,
    },
    orderDeadline: getRelativeTimestamp(2 * HOUR_MS + 20 * MINUTE_MS),
    pickupAddressArea: 'Lembang, Bandung Barat',
    pickupAddressFull: 'Jl. Raya Maribaya No. 45, Lembang',
    latitude: -6.8167,
    longitude: 107.6167,
    pickupScheduleSlots: [
      { id: 'slot-1', date: todayDate, startTime: '15:00', endTime: '17:00', isAvailable: true },
      { id: 'slot-2', date: tomorrowDate, startTime: '08:00', endTime: '10:00', isAvailable: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80',
    ],
    status: 'active',
    createdAt: getRelativeTimestamp(-10 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-1 * HOUR_MS),
  },
  {
    id: 'off-002',
    farmerId: 'usr-pt-02',
    farmerName: 'Bu Sumarni (Tani Barokah Pangalengan)',
    commodityName: 'Buncis Kenia Unggul',
    category: 'Sayuran',
    condition: 'surplus',
    surplusReason: 'Kelebihan kuota panen harian mitra katering, dipetik pagi ini',
    harvestDate: getRelativeTimestamp(-8 * HOUR_MS),
    availableStockKg: 120,
    reservedStockKg: 0,
    soldStockKg: 50,
    pricePerKg: 11000,
    orderDeadline: getRelativeTimestamp(2 * HOUR_MS + 50 * MINUTE_MS),
    pickupAddressArea: 'Pangalengan, Kab. Bandung',
    pickupAddressFull: 'Blok Pasir Pogor, Margamukti, Pangalengan',
    latitude: -7.1667,
    longitude: 107.5667,
    pickupScheduleSlots: [
      { id: 'slot-3', date: todayDate, startTime: '14:00', endTime: '17:00', isAvailable: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=640&q=80',
    ],
    status: 'active',
    createdAt: getRelativeTimestamp(-7 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-1 * HOUR_MS),
  },
  {
    id: 'off-004',
    farmerId: 'usr-pt-03',
    farmerName: 'Kang Dedi (Tani Muda Garut)',
    commodityName: 'Wortel Brastagi Ukuran Campur',
    category: 'Sayuran',
    condition: 'imperfect_shape',
    surplusReason: 'Ukuran bercabang dan tidak seragam untuk ritel, sangat baik untuk olahan dapur',
    harvestDate: getRelativeTimestamp(-16 * HOUR_MS),
    availableStockKg: 145.5,
    reservedStockKg: 12.5,
    soldStockKg: 42,
    pricePerKg: 7500,
    dynamicPriceRule: {
      startPrice: 9500,
      minPrice: 6500,
      dropIntervalHours: 4,
      dropAmount: 1000,
    },
    orderDeadline: getRelativeTimestamp(4 * HOUR_MS + 15 * MINUTE_MS),
    pickupAddressArea: 'Cikajang, Garut',
    pickupAddressFull: 'Kp. Cibodas RT 02/04, Cikajang, Garut',
    latitude: -7.2279,
    longitude: 107.9087,
    pickupScheduleSlots: [
      { id: 'slot-5', date: todayDate, startTime: '16:00', endTime: '18:30', isAvailable: true },
      {
        id: 'slot-5b',
        date: tomorrowDate,
        startTime: '07:00',
        endTime: '10:00',
        isAvailable: true,
      },
    ],
    photos: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=640&q=80',
    ],
    status: 'active',
    createdAt: getRelativeTimestamp(-15 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-3 * HOUR_MS),
  },
  {
    id: 'off-005',
    farmerId: 'usr-pt-04',
    farmerName: 'Bu Nining (Kebun Buah Subang)',
    commodityName: 'Nanas Madu Kupas Siap Olah',
    category: 'Buah',
    condition: 'ripe_urgent',
    surplusReason:
      'Panen puncak musim hujan, buah sangat manis dan harus segera diolah dalam 24 jam',
    harvestDate: getRelativeTimestamp(-9 * HOUR_MS),
    availableStockKg: 64,
    reservedStockKg: 16,
    soldStockKg: 80,
    pricePerKg: 9000,
    dynamicPriceRule: {
      startPrice: 11500,
      minPrice: 8000,
      dropIntervalHours: 3,
      dropAmount: 1000,
    },
    orderDeadline: getRelativeTimestamp(5 * HOUR_MS + 10 * MINUTE_MS),
    pickupAddressArea: 'Jalancagak, Subang',
    pickupAddressFull: 'Jl. Cagak Raya No. 18, Subang',
    latitude: -6.5715,
    longitude: 107.7587,
    pickupScheduleSlots: [
      { id: 'slot-6', date: tomorrowDate, startTime: '07:30', endTime: '10:30', isAvailable: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=640&q=80',
    ],
    status: 'active',
    createdAt: getRelativeTimestamp(-8 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-2 * HOUR_MS),
  },
  {
    id: 'off-006',
    farmerId: 'usr-pt-05',
    farmerName: 'Pak Hendra (Lumbung Cianjur)',
    commodityName: 'Ubi Cilembu Panen Surplus',
    category: 'Rempah & Umbi',
    condition: 'surplus',
    surplusReason: 'Panen serentak dua petak lahan, stok berlebih dengan kulit lecet ringan',
    harvestDate: getRelativeTimestamp(-18 * HOUR_MS),
    availableStockKg: 210,
    reservedStockKg: 20,
    soldStockKg: 90,
    pricePerKg: 8500,
    orderDeadline: getRelativeTimestamp(8 * HOUR_MS + 30 * MINUTE_MS),
    pickupAddressArea: 'Cipanas, Cianjur',
    pickupAddressFull: 'Desa Sindanglaya RT 03/01, Cipanas, Cianjur',
    latitude: -6.8168,
    longitude: 107.1425,
    pickupScheduleSlots: [
      { id: 'slot-7', date: tomorrowDate, startTime: '08:00', endTime: '11:00', isAvailable: true },
      {
        id: 'slot-7b',
        date: tomorrowDate,
        startTime: '14:00',
        endTime: '16:30',
        isAvailable: true,
      },
    ],
    photos: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=640&q=80',
    ],
    status: 'active',
    createdAt: getRelativeTimestamp(-14 * HOUR_MS),
    updatedAt: getRelativeTimestamp(-4 * HOUR_MS),
  },
]

export const mockOffersData: Offer[] = [...urgentOffersData, ...regularCatalogOffersData]
