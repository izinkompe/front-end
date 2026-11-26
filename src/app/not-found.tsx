import type { Metadata } from 'next'
import { ErrorPageShell } from '@/components/shared/error-page-shell'

export const metadata: Metadata = {
  title: 'Halaman tidak ditemukan',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFoundPage() {
  return <ErrorPageShell variant='404' />
}
