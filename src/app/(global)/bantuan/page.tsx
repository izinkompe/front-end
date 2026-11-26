import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'

export const metadata: Metadata = {
  title: 'Pusat Bantuan | PanganTani',
  description:
    'Panduan pemesanan, pembayaran transfer manual, pengambilan panen di kebun, dan pengaduan.',
}

export default function HelpPage() {
  return <InfoCenterView activeTab='bantuan' />
}
