import type { Metadata } from 'next'
import { AccountTransactionsView } from '@/components/account/account-transactions-view'

export const metadata: Metadata = {
  title: 'Riwayat Transaksi | PanganTani',
}

export default function AccountTransactionsPage() {
  return <AccountTransactionsView />
}
