import type { Metadata } from 'next'
import { AdminPenggunaView } from '@/components/dashboard/admin-pengguna-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Pengguna & Akses',
  description: 'Pengelolaan pengguna dan kebijakan akses RBAC platform.',
})

export default function AdminUsersPage() {
  return <AdminPenggunaView />
}
