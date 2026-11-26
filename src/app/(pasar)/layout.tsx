import type { Metadata } from 'next'
import { GlobalHeader } from '@/components/layout/global-header'

export const metadata: Metadata = {
  title: 'Pasar Panen Surplus | PanganTani',
  description:
    'Jelajahi penawaran panen surplus per kilogram dengan sistem ambil mandiri langsung dari petani sekitar Anda.',
}

export default function PasarLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <GlobalHeader />
      <main className='flex flex-1 flex-col'>{children}</main>
    </div>
  )
}
