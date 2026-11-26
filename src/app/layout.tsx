import type { Metadata } from 'next'
import { Geist_Mono, IBM_Plex_Sans } from 'next/font/google'
import { BuyerAuthPromptProvider } from '@/components/auth/buyer-auth-prompt-provider'
import { FavoritesSidebarProvider } from '@/components/favorites/favorites-sidebar-provider'
import { AccessibilityProvider } from '@/components/providers/accessibility-provider'
import { LocationProvider } from '@/components/providers/location-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { cn } from '@/lib/utils'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PanganTani',
  description: 'Platform Kolaborasi Agrikultur dan Pangan Berkelanjutan',
  other: {
    'text-scale': 'scale',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='id'
      className={cn('h-full antialiased font-sans', ibmPlexSans.variable, geistMono.variable)}
    >
      <body className='min-h-full flex flex-col font-sans text-base'>
        <QueryProvider>
          <AccessibilityProvider>
            <LocationProvider>
              <BuyerAuthPromptProvider>
                <FavoritesSidebarProvider>{children}</FavoritesSidebarProvider>
              </BuyerAuthPromptProvider>
            </LocationProvider>
          </AccessibilityProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
