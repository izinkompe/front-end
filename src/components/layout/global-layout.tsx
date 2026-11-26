import { GlobalHeader } from './global-header'
import { GlobalFooter } from './global-footer'

interface GlobalLayoutProps {
  children: React.ReactNode
  containerClassName?: string
}

export function GlobalLayout({
  children,
  containerClassName = 'max-w-7xl',
}: Readonly<GlobalLayoutProps>) {
  return (
    <div className='flex min-h-dvh flex-col bg-background text-foreground'>
      <a href='#konten-utama' className='skip-link'>
        Lewati ke konten utama
      </a>
      <GlobalHeader />
      <main id='konten-utama' tabIndex={-1} className='flex-1 flex flex-col'>
        {children}
      </main>
      <GlobalFooter containerClassName={containerClassName} />
    </div>
  )
}
