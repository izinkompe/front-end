import type { Metadata } from 'next'
import { Geist_Mono, IBM_Plex_Sans } from 'next/font/google'
import { BuyerAuthPromptProvider } from '@/components/auth/buyer-auth-prompt-provider'
import { FavoritesSidebarProvider } from '@/components/favorites/favorites-sidebar-provider'
import { AccessibilityProvider } from '@/components/providers/accessibility-provider'
import { LocationProvider } from '@/components/providers/location-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { StoreSyncEffect } from '@/components/providers/store-sync-effect'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_NAME,
  getSiteUrl,
} from '@/lib/seo'
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
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
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
          <StoreSyncEffect />
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
