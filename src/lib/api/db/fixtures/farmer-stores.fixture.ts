import type { FarmerReview } from '@/types/api/farmers'

export interface FarmerStoreFixtureMeta {
  farmerId: string
  description: string
  publicPickupNotes: string
  baseFollowerCount: number
  baseDistributedKg: number
}

export const mockFarmerStoreMeta: Record<string, FarmerStoreFixtureMeta> = {
  'usr-pt-01': {
    farmerId: 'usr-pt-01',
    description:
      'Kelompok Tani Subur Makmur mengelola lahan hortikultura dataran tinggi Lembang bersama 14 petani mitra. Fokus menyalurkan hasil panen surplus harian dan komoditas grade B segar langsung ke dapur umum, katering, dan pelaku usaha kuliner.',
    publicPickupNotes:
      'Pengambilan mandiri tersedia setiap hari sesuai slot jam yang dipilih. Harap membawa keranjang atau peti kemasan sendiri; timbangan digital tersedia di pos sortir kebun.',
    baseFollowerCount: 148,
    baseDistributedKg: 2450,
  },
  'usr-pt-02': {
    farmerId: 'usr-pt-02',
    description:
      'Tani Barokah Pangalengan menyalurkan sayuran daun dan umbi-umbian hasil panen serentak petani dataran tinggi Bandung Selatan agar tidak terbuang pascapanen.',
    publicPickupNotes:
      'Barang ditimbang bersama pembeli saat serah terima di gudang sortir. Disarankan tiba 15 menit sebelum slot berakhir.',
    baseFollowerCount: 96,
    baseDistributedKg: 1840,
  },
  'usr-pt-03': {
    farmerId: 'usr-pt-03',
    description:
      'Tani Muda Garut berfokus pada penyaluran buah dan sayuran ukuran tidak seragam yang tetap segar dan layak olah untuk kebutuhan dapur skala besar.',
    publicPickupNotes:
      'Area muat kendaraan bak terbuka tersedia hingga halaman kebun. Sediakan alas terpal atau keranjang bersih untuk komoditas tanpa kemasan.',
    baseFollowerCount: 64,
    baseDistributedKg: 980,
  },
  'usr-pt-04': {
    farmerId: 'usr-pt-04',
    description:
      'Kebun Buah Subang menyediakan nanas matang pohon dan hasil bumi pilihan dengan perputaran panen cepat untuk olahan jus, selai, dan sambal.',
    publicPickupNotes:
      'Untuk komoditas matang segera olah atau kupas, pembeli wajib membawa wadah food-grade tertutup saat pengambilan.',
    baseFollowerCount: 73,
    baseDistributedKg: 1120,
  },
  'usr-pt-05': {
    farmerId: 'usr-pt-05',
    description:
      'Koperasi Lumbung Cianjur menghimpun gabah, beras gilingan baru, serta umbi-umbian dari kelompok tani sekitar Cipanas untuk pasokan rutin panti sosial dan katering.',
    publicPickupNotes:
      'Tersedia karung ukuran 25 kg dan 50 kg. Mohon konfirmasi kedatangan melalui catatan pesanan agar stok disiapkan di pintu muat.',
    baseFollowerCount: 119,
    baseDistributedKg: 3120,
  },
  'usr-pt-06': {
    farmerId: 'usr-pt-06',
    description:
      'Kebun Hijau Cisarua menanam pisang, rimpang, dan sayuran pekarangan secara bertahap serta menyalurkan kelebihan panen mingguan tanpa perantara.',
    publicPickupNotes:
      'Lokasi dekat jalur utama Cisarua dan dapat diakses mobil niaga kecil sesuai jadwal slot ambil mandiri.',
    baseFollowerCount: 52,
    baseDistributedKg: 760,
  },
  'usr-pt-07': {
    farmerId: 'usr-pt-07',
    description:
      'Koperasi Tani Majalengka menyalurkan kedelai lokal kering dan bawang merah hasil sortiran panen petani mitra untuk produsen tahu-tempe dan dapur umum.',
    publicPickupNotes:
      'Pengambilan dilakukan di gudang timur sesuai jam operasional. Tunjukkan nomor pesanan saat verifikasi berat di lokasi.',
    baseFollowerCount: 88,
    baseDistributedKg: 2190,
  },
}

export const mockFarmerReviewsData: FarmerReview[] = [
  {
    id: 'rev-001',
    farmerId: 'usr-pt-01',
    orderId: 'ord-901',
    offerId: 'off-001',
    commodityName: 'Tomat Ceri Hidroponik',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80',
    quantityKg: 25,
    buyerDisplayName: 'Dapur Umum Yayasan Kasih',
    rating: 5,
    topics: ['freshness', 'weight_accuracy', 'pickup_ease'],
    comment:
      'Tomat masih sangat segar meski ukuran campur. Timbangan di pos sortir pas 25,1 kg dan proses serah terima cepat.',
    photos: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80',
    ],
    helpfulCount: 14,
    farmerReply: {
      message:
        'Terima kasih Ibu Ratna dan tim Yayasan Kasih. Senang stok tomat ceri bisa langsung terolah untuk makan siang.',
      repliedAt: '2026-11-24T09:30:00Z',
    },
    createdAt: '2026-11-24T07:15:00Z',
  },
  {
    id: 'rev-002',
    farmerId: 'usr-pt-01',
    orderId: 'ord-902',
    offerId: 'off-003',
    commodityName: 'Mangga Harum Manis Matang Pohon',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=80',
    quantityKg: 40,
    buyerDisplayName: 'K***a Kuliner Bandung',
    rating: 5,
    topics: ['freshness', 'condition_match'],
    comment:
      'Sesuai penjelasan kondisi matang pohon 95 persen, manis untuk olahan jus dan selai tanpa banyak bagian terbuang.',
    photos: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=80',
    ],
    helpfulCount: 9,
    farmerReply: {
      message: 'Terima kasih sudah mengambil tepat waktu sesuai slot sore.',
      repliedAt: '2026-11-22T14:20:00Z',
    },
    createdAt: '2026-11-22T11:45:00Z',
  },
  {
    id: 'rev-003',
    farmerId: 'usr-pt-01',
    orderId: 'ord-903',
    offerId: 'off-011',
    commodityName: 'Jagung Manis Pipil Segar',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=640&q=80',
    quantityKg: 35,
    buyerDisplayName: 'P***i Asuhan Harapan',
    rating: 4,
    topics: ['weight_accuracy', 'pickup_ease'],
    comment:
      'Jagung sudah bersih dan siap rebus. Sempat antre 10 menit karena berbarengan jadwal pengambilan pembeli lain.',
    photos: [],
    helpfulCount: 5,
    createdAt: '2026-11-20T16:10:00Z',
  },
  {
    id: 'rev-004',
    farmerId: 'usr-pt-01',
    orderId: 'ord-904',
    offerId: 'off-001',
    commodityName: 'Tomat Ceri Hidroponik',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80',
    quantityKg: 18,
    buyerDisplayName: 'W***g Sambal Coblong',
    rating: 5,
    topics: ['freshness', 'weight_accuracy', 'condition_match'],
    comment:
      'Harga turun sesuai jadwal harga dinamis dan kualitas tetap prima untuk bahan sambal harian.',
    photos: [],
    helpfulCount: 7,
    createdAt: '2026-11-18T08:40:00Z',
  },
  {
    id: 'rev-005',
    farmerId: 'usr-pt-02',
    orderId: 'ord-905',
    offerId: 'off-002',
    commodityName: 'Buncis Kenia Unggul',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=640&q=80',
    quantityKg: 30,
    buyerDisplayName: 'C***a Katering Sehat',
    rating: 5,
    topics: ['freshness', 'weight_accuracy', 'pickup_ease'],
    comment:
      'Dipetik pagi hari sehingga masih renyah saat diambil siang. Penimbangan ulang transparan di teras gudang.',
    photos: [
      'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=640&q=80',
    ],
    helpfulCount: 11,
    farmerReply: {
      message: 'Terima kasih atas kepercayaannya mengambil panen di Pangalengan.',
      repliedAt: '2026-11-23T15:00:00Z',
    },
    createdAt: '2026-11-23T12:20:00Z',
  },
  {
    id: 'rev-006',
    farmerId: 'usr-pt-02',
    orderId: 'ord-906',
    offerId: 'off-014',
    commodityName: 'Kentang Granola Ukuran Kecil',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=80',
    quantityKg: 50,
    buyerDisplayName: 'D***r Nasi Kotak Soreang',
    rating: 4,
    topics: ['condition_match', 'weight_accuracy'],
    comment:
      'Ukuran baby kentang sangat pas untuk balado tanpa perlu dipotong lagi. Tanah sedikit menempel tapi wajar.',
    photos: [],
    helpfulCount: 4,
    createdAt: '2026-11-19T10:10:00Z',
  },
  {
    id: 'rev-007',
    farmerId: 'usr-pt-03',
    orderId: 'ord-907',
    offerId: 'off-004',
    commodityName: 'Wortel Brastagi Ukuran Campur',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=640&q=80',
    quantityKg: 45,
    buyerDisplayName: 'K***g Masak Garut',
    rating: 5,
    topics: ['freshness', 'condition_match'],
    comment:
      'Meskipun bentuk bercabang, wortel manis dan padat. Sangat membantu menekan biaya bahan sop katering.',
    photos: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=640&q=80',
    ],
    helpfulCount: 8,
    createdAt: '2026-11-21T14:00:00Z',
  },
  {
    id: 'rev-008',
    farmerId: 'usr-pt-04',
    orderId: 'ord-908',
    offerId: 'off-005',
    commodityName: 'Nanas Madu Kupas Siap Olah',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=640&q=80',
    quantityKg: 20,
    buyerDisplayName: 'U***a Selai Subang',
    rating: 5,
    topics: ['freshness', 'pickup_ease'],
    comment:
      'Nanas sudah dikupas bersih dan dikemas rapi ke wadah yang kami bawa. Rasa sangat manis.',
    photos: [],
    helpfulCount: 6,
    createdAt: '2026-11-21T09:15:00Z',
  },
  {
    id: 'rev-009',
    farmerId: 'usr-pt-05',
    orderId: 'ord-909',
    offerId: 'off-010',
    commodityName: 'Beras Medium Gilingan Baru',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80',
    quantityKg: 100,
    buyerDisplayName: 'Y***n Peduli Cianjur',
    rating: 5,
    topics: ['weight_accuracy', 'pickup_ease', 'condition_match'],
    comment:
      'Dua karung masing-masing 50 kg ditimbang tepat di depan tim kami. Pulen saat dimasak untuk dapur umum.',
    photos: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80',
    ],
    helpfulCount: 15,
    farmerReply: {
      message: 'Terima kasih atas sinerginya untuk dapur umum di Cianjur.',
      repliedAt: '2026-11-20T17:45:00Z',
    },
    createdAt: '2026-11-20T13:30:00Z',
  },
  {
    id: 'rev-010',
    farmerId: 'usr-pt-06',
    orderId: 'ord-910',
    offerId: 'off-008',
    commodityName: 'Pisang Ambon Matang Serentak',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=640&q=80',
    quantityKg: 28,
    buyerDisplayName: 'B***i Kue Cisarua',
    rating: 5,
    topics: ['freshness', 'condition_match'],
    comment: 'Tingkat kematangan merata dan harum, cocok langsung masuk adonan bolu pisang.',
    photos: [],
    helpfulCount: 4,
    createdAt: '2026-11-19T16:40:00Z',
  },
  {
    id: 'rev-011',
    farmerId: 'usr-pt-07',
    orderId: 'ord-911',
    offerId: 'off-013',
    commodityName: 'Kedelai Lokal Panen Kering',
    commodityPhotoUrl:
      'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=640&q=80',
    quantityKg: 80,
    buyerDisplayName: 'P***n Tempe Majalengka',
    rating: 5,
    topics: ['weight_accuracy', 'freshness', 'pickup_ease'],
    comment:
      'Kadar air kering merata dan bersih dari kerikil, hasil rebusan mengembang bagus untuk produksi tempe.',
    photos: [
      'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=640&q=80',
    ],
    helpfulCount: 10,
    createdAt: '2026-11-22T08:50:00Z',
  },
]
