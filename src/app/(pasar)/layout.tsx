import { GlobalHeader } from '@/components/layout/global-header'

export default function PasarLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex min-h-dvh flex-col bg-background text-foreground'>
      <a href='#konten-utama' className='skip-link'>
        Lewati ke konten utama
      </a>
      <GlobalHeader />
      <main id='konten-utama' tabIndex={-1} className='flex flex-1 flex-col'>
        {children}
      </main>
    </div>
  )
}
