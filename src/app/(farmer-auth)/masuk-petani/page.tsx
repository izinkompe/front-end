import type { Metadata } from 'next'
import { FarmerLoginForm } from '@/components/auth/farmer/farmer-login-form'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Masuk Petani',
  description: 'Masuk ke akun petani PanganTani untuk mengelola penawaran hasil panen dan pesanan.',
})

export default function FarmerLoginPage() {
  return <FarmerLoginForm />
}
