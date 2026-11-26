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
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <a
        href='#konten-utama'
        className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-60 focus:rounded-md focus:bg-background focus:p-3'
      >
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
