import type { Metadata } from 'next'
import { AccountTransactionsView } from '@/components/account/account-transactions-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Riwayat Transaksi',
  description: 'Lihat riwayat pembayaran transfer manual dan status transaksi pesanan PanganTani.',
})

export default function AccountTransactionsPage() {
  return <AccountTransactionsView />
}
