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
      <GlobalHeader />
      <main className='flex-1 flex flex-col'>{children}</main>
      <GlobalFooter containerClassName={containerClassName} />
    </div>
  )
}
