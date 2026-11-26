import { GlobalHeader } from '@/components/layout/global-header'

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
