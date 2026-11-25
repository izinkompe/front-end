import { LocationProvider } from '@/components/providers/location-provider'
import { GlobalHeader } from './global-header'
import { GlobalFooter } from './global-footer'

export function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LocationProvider>
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <GlobalHeader />
        <main className='flex-1 flex flex-col'>{children}</main>
        <GlobalFooter />
      </div>
    </LocationProvider>
  )
}
