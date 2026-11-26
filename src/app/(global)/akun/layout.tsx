import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { AccountShell } from '@/components/account/account-shell'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Akun & Profil',
  description: 'Kelola pesanan, data profil, alamat, transaksi, dan pengaturan akun PanganTani.',
})

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>
}
