import type { User } from '@/types/api/auth'

export const mockUsersData: User[] = [
  {
    id: 'usr-pb-01',
    name: 'Ibu Ratna',
    email: 'ratna@dapurkasih.org',
    phone: '081234567890',
    role: 'buyer',
    organization: 'Dapur Umum Yayasan Kasih',
    addresses: [
      {
        id: 'addr-01',
        label: 'Dapur Utama',
        fullAddress: 'Jl. Babakan Siliwangi No. 12, Coblong, Bandung',
        areaName: 'Coblong, Bandung',
        latitude: -6.8856,
        longitude: 107.6111,
        isDefault: true,
      },
    ],
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'usr-pt-01',
    name: 'Pak Joko',
    email: 'joko@suburmakmur.id',
    phone: '081398765432',
    role: 'farmer',
    organization: 'Kelompok Tani Subur Makmur',
    isVerifiedFarmer: true,
    addresses: [
      {
        id: 'addr-02',
        label: 'Kebun Lembang',
        fullAddress: 'Jl. Raya Maribaya No. 45, Lembang, Bandung Barat',
        areaName: 'Lembang, Bandung Barat',
        latitude: -6.8167,
        longitude: 107.6167,
        isDefault: true,
      },
    ],
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-20T08:00:00Z',
  },
  {
    id: 'usr-ad-01',
    name: 'Admin Operasional',
    email: 'admin@pangantani.id',
    phone: '081122334455',
    role: 'admin',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
]
