import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AdminLoginForm } from '@/components/auth/admin/admin-login-form'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Masuk Admin Operasional',
  description: 'Masuk ke dashboard operasional admin PanganTani.',
})

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  )
}
