'use client'

import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FarmerVerificationBannerProps {
  isVerified?: boolean
  context?: 'overview' | 'offers' | 'needs-board'
}

const CONTEXT_COPY: Record<NonNullable<FarmerVerificationBannerProps['context']>, string> = {
  overview:
    'Anda sudah dapat mengatur toko, menambah kebun, dan menyimpan draf penawaran. Penerbitan penawaran dan tanggapan Papan Kebutuhan terbuka setelah akun disetujui Admin.',
  offers:
    'Anda dapat menyimpan draf penawaran sekarang. Tombol Terbitkan Penawaran terkunci sampai akun Anda disetujui Admin.',
  'needs-board':
    'Anda dapat menelusuri permintaan pembeli sekarang. Pengiriman tanggapan terkunci sampai akun Anda disetujui Admin.',
}

export function FarmerVerificationBanner({
  isVerified,
  context = 'overview',
}: FarmerVerificationBannerProps) {
  if (isVerified) {
    return null
  }

  return (
    <Alert className='border-border bg-muted/40'>
      <ShieldAlert className='icon-md' aria-hidden='true' />
      <AlertTitle>Menunggu verifikasi Admin</AlertTitle>
      <AlertDescription>{CONTEXT_COPY[context]}</AlertDescription>
    </Alert>
  )
}
