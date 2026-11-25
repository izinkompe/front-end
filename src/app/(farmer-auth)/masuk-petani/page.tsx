import type { Metadata } from 'next'
import { FarmerLoginForm } from '@/components/auth/farmer/farmer-login-form'

export const metadata: Metadata = {
  title: 'Masuk Petani | PanganTani',
  description: 'Masuk ke akun petani PanganTani untuk mengelola penawaran hasil panen dan pesanan.',
}

export default function FarmerLoginPage() {
  return <FarmerLoginForm />
}
