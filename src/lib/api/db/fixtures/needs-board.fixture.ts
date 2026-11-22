import type { NeedRequest } from '@/types/api/needs-board'

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
    targetDate: '2026-11-26',
    targetArea: 'Coblong, Bandung',
    notes: 'Kebutuhan distribusi paket makan siang dapur umum.',
    status: 'open',
    responses: [
      {
        id: 'resp-001',
        farmerId: 'usr-pt-01',
        farmerName: 'Pak Joko (Kelompok Tani Subur Makmur)',
        offerId: 'off-001',
        offeredQuantityKg: 200,
        offeredPricePerKg: 12500,
        availableDate: '2026-11-25',
        message: 'Ada stok beras surplus gilingan minggu ini siap diambil.',
        createdAt: '2026-11-23T02:00:00Z',
      },
    ],
    createdAt: '2026-11-22T14:00:00Z',
    updatedAt: '2026-11-23T02:00:00Z',
  },
]
