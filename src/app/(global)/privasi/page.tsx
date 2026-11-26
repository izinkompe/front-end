import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | PanganTani',
  description:
    'Kebijakan privasi mengenai pengelolaan data akun, transaksi, bukti pembayaran, dan preferensi peramban.',
}

export default function PrivacyPage() {
  return <InfoCenterView activeTab='kebijakan-privasi' />
}
