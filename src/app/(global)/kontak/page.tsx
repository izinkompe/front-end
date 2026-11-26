import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'

export const metadata: Metadata = {
  title: 'Kontak | PanganTani',
  description:
    'Kanal resmi untuk pertanyaan pesanan, verifikasi transfer, pengaduan, dan kemitraan petani PanganTani.',
}

export default function ContactPage() {
  return <InfoCenterView activeTab='kontak' />
}
