import type { Metadata } from 'next'
import { AdminVerifikasiView } from '@/components/dashboard/admin-verifikasi-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Verifikasi Petani',
  description: 'Antrean tinjauan verifikasi akun dan dokumen petani PanganTani.',
})

export default function AdminVerificationPage() {
  return <AdminVerifikasiView />
}
