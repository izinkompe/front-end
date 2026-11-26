import type { Metadata } from 'next'
import { TermsOfUseView } from '@/components/info/terms-of-use-view'

export const metadata: Metadata = {
  title: 'Syarat dan Ketentuan | PanganTani',
  description:
    'Syarat, ketentuan, dan pemberitahuan penggunaan layanan PanganTani untuk pembeli dan petani mitra.',
}

export default function TermsPage() {
  return <TermsOfUseView />
}
