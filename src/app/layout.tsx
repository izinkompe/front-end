import type { Metadata } from 'next'
import { Lato, Lora, Geist_Mono } from 'next/font/google'
import './globals.css'

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PanganTani',
  description: 'Platform Kolaborasi Agrikultur dan Pangan Berkelanjutan',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='id'
      className={`${lato.variable} ${lora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col font-sans text-base'>{children}</body>
    </html>
  )
}
