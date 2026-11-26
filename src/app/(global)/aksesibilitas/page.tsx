import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'

export const metadata: Metadata = {
  title: 'Aksesibilitas | PanganTani',
  description: 'Pengaturan aksesibilitas tampilan PanganTani yang tersimpan di peramban pengguna.',
}

export default function AccessibilityPage() {
  return <InfoCenterView activeTab='aksesibilitas' />
}
