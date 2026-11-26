export const TERMS_EFFECTIVE_DATE = '26 November 2026'

export interface InfoCenterLinkItem {
  label: string
  href: string
  active?: boolean
}

export const INFO_CENTER_LINKS: InfoCenterLinkItem[] = [
  { label: 'Pusat Bantuan', href: '/bantuan' },
  { label: 'Syarat & Ketentuan', href: '/syarat', active: true },
  { label: 'Kebijakan Privasi', href: '/privasi' },
  { label: 'Aksesibilitas', href: '/aksesibilitas' },
]

export interface TocSubItem {
  id: string
  label: string
}

export interface TocItem {
  id: string
  label: string
  children?: TocSubItem[]
}

export const TERMS_TOC_ITEMS: TocItem[] = [
  { id: 'penggunaan-layanan', label: 'PENGGUNAAN LAYANAN' },
  { id: 'fitur-tambahan', label: 'FITUR DAN LAYANAN TAMBAHAN' },
  {
    id: 'reservasi-dan-pembayaran',
    label: 'KETENTUAN RESERVASI, PEMBAYARAN, DAN PENGEMBALIAN DANA',
    children: [
      { id: 'mekanisme-reservasi', label: 'Mekanisme Reservasi dan Penguncian Harga' },
      { id: 'pembayaran-transfer', label: 'Pembayaran Transfer Manual dan Verifikasi' },
      { id: 'ringkasan-ketentuan-transaksi', label: 'Ringkasan Batasan dan Ketentuan Transaksi' },
      { id: 'pembatalan-dan-pengembalian', label: 'Pembatalan Pesanan dan Pengembalian Dana' },
    ],
  },
  { id: 'aktivitas-terlarang', label: 'AKTIVITAS YANG DILARANG' },
  { id: 'kebijakan-privasi', label: 'KEBIJAKAN PRIVASI DAN PENGUNGKAPAN DATA' },
  {
    id: 'konten-dan-lisensi',
    label: 'KONTEN PENGGUNA, PAPAN KEBUTUHAN, DAN PEMBERIAN LISENSI',
    children: [
      { id: 'batasan-konten-pengguna', label: 'Batasan Konten yang Diunggah' },
      { id: 'moderasi-dan-penangguhan', label: 'Pembatasan dan Penangguhan Akses Layanan' },
    ],
  },
  {
    id: 'transaksi-petani',
    label: 'TRANSAKSI LANGSUNG DENGAN PETANI MITRA',
    children: [
      { id: 'peran-pangantani', label: 'Peran PanganTani sebagai Fasilitator Pasar Panen' },
      { id: 'pengambilan-dan-penimbangan', label: 'Pengambilan di Lokasi dan Penimbangan Aktual' },
    ],
  },
  { id: 'penafian-tanggung-jawab', label: 'PENAFIAN TANGGUNG JAWAB' },
  { id: 'ganti-rugi', label: 'GANTI RUGI' },
  { id: 'tautan-pihak-ketiga', label: 'TAUTAN KE SITUS PIHAK KETIGA' },
  { id: 'perangkat-lunak', label: 'PERANGKAT LUNAK SEBAGAI BAGIAN DARI LAYANAN' },
  {
    id: 'hak-cipta',
    label: 'PEMBERITAHUAN HAK CIPTA DAN MEREK DAGANG',
    children: [
      { id: 'prosedur-pengaduan-konten', label: 'Prosedur Pelaporan dan Penurunan Konten Ilegal' },
    ],
  },
  {
    id: 'perubahan-dan-penghentian',
    label: 'PERUBAHAN PERJANJIAN; PEMBARUAN LAYANAN; PENGHENTIAN',
  },
  { id: 'hukum-yang-berlaku', label: 'YURISDIKSI DAN HUKUM YANG MENGATUR' },
  { id: 'ketentuan-umum', label: 'KETENTUAN UMUM' },
  { id: 'bantuan-layanan', label: 'BANTUAN LAYANAN' },
]

export interface TransactionRuleRow {
  aspect: string
  reservationAndPayment: string
  cancellationAndRefund: string
}

export const TRANSACTION_RULES_ROWS: TransactionRuleRow[] = [
  {
    aspect: 'Batas waktu tindakan',
    reservationAndPayment:
      'Stok dan harga dikunci selama 30 menit setelah reservasi dibuat untuk menyelesaikan transfer manual dan mengunggah bukti pembayaran.',
    cancellationAndRefund:
      'Pembatalan pra-bayar dapat dilakukan kapan saja sebelum batas bayar berakhir. Pembatalan pasca-bayar diajukan melalui detail pesanan.',
  },
  {
    aspect: 'Format dan batas bukti',
    reservationAndPayment:
      'Bukti transfer harus berupa berkas JPEG atau PNG dengan ukuran maksimal 5 MB yang menampilkan nominal serta rekening tujuan secara jelas.',
    cancellationAndRefund:
      'Pengaduan selisih berat atau kondisi panen disertai foto aktual dan catatan berat hasil penimbangan bersama petani.',
  },
  {
    aspect: 'Verifikasi administrator',
    reservationAndPayment:
      'Administrator memeriksa kecocokan bukti transfer. Jika ditolak karena tidak terbaca atau nominal kurang, unggah ulang sebelum tenggat berakhir.',
    cancellationAndRefund:
      'Administrator meninjau permohonan pembatalan pasca-bayar dan pengaduan melalui halaman Pengaduan Saya sebelum menyetujui pengembalian.',
  },
  {
    aspect: 'Satuan harga dan berat',
    reservationAndPayment:
      'Satu pesanan berlaku untuk satu penawaran dari satu petani. Berat dicatat dalam kilogram hingga tiga angka desimal (0,001 kg) dalam Rupiah per kg.',
    cancellationAndRefund:
      'Jika berat aktual saat penimbangan lebih rendah dari estimasi reservasi, selisih nilai dapat diajukan melalui laporan masalah pesanan.',
  },
  {
    aspect: 'Mekanisme pengembalian dana',
    reservationAndPayment:
      'Tidak ada pemotongan otomatis kartu; seluruh pembayaran dilakukan melalui transfer bank manual ke rekening yang tercantum pada tagihan.',
    cancellationAndRefund:
      'Pengembalian dana yang disetujui ditransfer secara manual ke rekening bank tujuan yang tercatat pada akun atau formulir laporan Anda.',
  },
]

export const PROHIBITED_ACTIVITIES: string[] = [
  'Menggunakan Layanan atau Konten untuk tujuan komersial di luar cakupan yang secara tegas diizinkan dalam Perjanjian ini, termasuk memperjualbelikan ulang data katalog penawaran panen.',
  'Mengakses, memantau, menyalin, mengunduh massal, atau mengeksploitasi Konten Layanan (termasuk profil petani, harga panen, dan foto produk) menggunakan robot, spider, scraper, sistem kecerdasan buatan (AI), atau proses otomatis lainnya tanpa izin tertulis dari PanganTani.',
  'Melanggar pembatasan pada header pengecualian robot atau mengakali langkah pengamanan teknis yang diterapkan untuk membatasi akses ke Layanan.',
  'Melakukan tindakan yang membebani atau berpotensi membebani infrastruktur PanganTani secara tidak wajar atau tidak proporsional.',
  'Melakukan deep-linking ke bagian mana pun dari Layanan, atau melakukan framing dan mirroring bagian Layanan ke situs web atau aplikasi lain tanpa izin tertulis.',
  'Mencoba memodifikasi, menerjemahkan, mengadaptasi, mendekompilasi, membongkar, atau melakukan rekayasa balik terhadap perangkat lunak yang digunakan PanganTani.',
  'Membuat pesanan fiktif untuk mengunci stok petani tanpa niat membayar, memanipulasi berat aktual secara sepihak, atau menghindari pencatatan transaksi resmi di platform.',
  'Menyebarkan virus, perangkat lunak perusak, atau kode berbahaya yang dapat mengganggu ketersediaan dan integritas Layanan.',
]

export const PROHIBITED_CONTENT_RULES: string[] = [
  'Bersifat palsu, menyesatkan, melanggar hukum, memfitnah, mencemarkan nama baik, cabul, mengancam, melecehkan, atau melanggar privasi pihak lain.',
  'Mendorong kebencian, diskriminasi, atau tindakan yang membahayakan keselamatan kelompok maupun individu mana pun.',
  'Mendorong, memfasilitasi, atau memberikan instruksi untuk tindakan ilegal atau pelanggaran peraturan perundang-undangan di Republik Indonesia.',
  'Melanggar hak cipta, merek dagang, rahasia dagang, atau hak kekayaan intelektual milik PanganTani maupun pihak ketiga.',
  'Berupa pengiriman massal yang tidak diminta (spam), penipuan, atau skema yang menyesatkan pengguna lain.',
  'Menyamar sebagai orang lain, perwakilan petani, atau pihak PanganTani secara tidak sah.',
  'Memuat data pribadi sensitif pihak ketiga (seperti nomor identitas kependudukan, nomor rekening pribadi di luar alur transaksi, atau kata sandi) tanpa persetujuan pemiliknya.',
]

export const SURVIVAL_SECTIONS: string[] = [
  'Fitur dan Layanan Tambahan',
  'Aktivitas yang Dilarang',
  'Konten Pengguna, Papan Kebutuhan, dan Pemberian Lisensi',
  'Penafian Tanggung Jawab',
  'Ganti Rugi',
  'Perangkat Lunak sebagai Bagian dari Layanan',
  'Pemberitahuan Hak Cipta dan Merek Dagang',
  'Perubahan Perjanjian; Pembaruan Layanan; Penghentian',
  'Yurisdiksi dan Hukum yang Mengatur',
  'Ketentuan Umum',
  'Bantuan Layanan',
]
