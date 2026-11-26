export type InfoCenterTab = 'bantuan' | 'syarat' | 'kebijakan-privasi' | 'aksesibilitas' | 'kontak'

export interface InfoCenterTabConfig {
  id: InfoCenterTab
  label: string
  href: string
  title: string
  subtitle?: string
  description: string
}

export const INFO_CENTER_TABS: InfoCenterTabConfig[] = [
  {
    id: 'bantuan',
    label: 'Pusat Bantuan',
    href: '/pusat-informasi?tab=bantuan',
    title: 'Pusat Bantuan PanganTani',
    subtitle: 'Panduan Pengguna',
    description:
      'Panduan pemesanan, pembayaran transfer manual, pengambilan panen di kebun, dan pengaduan.',
  },
  {
    id: 'syarat',
    label: 'Syarat & Ketentuan',
    href: '/pusat-informasi?tab=syarat',
    title: 'Syarat, Ketentuan, dan Pemberitahuan PanganTani',
    subtitle: 'Ketentuan Penggunaan',
    description: 'Ketentuan penggunaan layanan bagi pembeli dan petani mitra di PanganTani.',
  },
  {
    id: 'kebijakan-privasi',
    label: 'Kebijakan Privasi',
    href: '/pusat-informasi?tab=kebijakan-privasi',
    title: 'Kebijakan Privasi PanganTani',
    subtitle: 'Perlindungan Data Pengguna',
    description:
      'Penjelasan mengenai pengelolaan data akun, transaksi, bukti pembayaran, dan preferensi peramban.',
  },
  {
    id: 'aksesibilitas',
    label: 'Aksesibilitas',
    href: '/pusat-informasi?tab=aksesibilitas',
    title: 'Pengaturan Aksesibilitas PanganTani',
    subtitle: 'Kenyamanan Tampilan',
    description:
      'Sesuaikan ukuran teks, kontras, dan preferensi tampilan yang tersimpan langsung di peramban ini.',
  },
  {
    id: 'kontak',
    label: 'Kontak',
    href: '/pusat-informasi?tab=kontak',
    title: 'Hubungi PanganTani',
    subtitle: 'Layanan Pengguna dan Kemitraan',
    description:
      'Kanal resmi untuk pertanyaan pesanan, verifikasi transfer, pengaduan, serta kemitraan petani.',
  },
]

const TAB_ALIASES: Record<string, InfoCenterTab> = {
  bantuan: 'bantuan',
  'pusat-bantuan': 'bantuan',
  syarat: 'syarat',
  'syarat-dan-ketentuan': 'syarat',
  tos: 'syarat',
  privasi: 'kebijakan-privasi',
  'kebijakan-privasi': 'kebijakan-privasi',
  aksesibilitas: 'aksesibilitas',
  kontak: 'kontak',
  'hubungi-kami': 'kontak',
  contact: 'kontak',
}

export function resolveInfoCenterTab(rawTab?: string | string[]): InfoCenterTab {
  const value = Array.isArray(rawTab) ? rawTab[0] : rawTab
  if (!value) {
    return 'bantuan'
  }
  const normalized = value.trim().toLowerCase()
  return TAB_ALIASES[normalized] ?? 'bantuan'
}

export function getInfoCenterTabConfig(tab: InfoCenterTab): InfoCenterTabConfig {
  return INFO_CENTER_TABS.find((item) => item.id === tab) ?? INFO_CENTER_TABS[0]
}
