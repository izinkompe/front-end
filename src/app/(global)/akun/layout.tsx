import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { AccountShell } from '@/components/account/account-shell'

export const metadata: Metadata = {
  title: 'Akun & Profil | PanganTani',
  description: 'Kelola pesanan, data profil, alamat, transaksi, dan pengaturan akun PanganTani.',
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>
}
