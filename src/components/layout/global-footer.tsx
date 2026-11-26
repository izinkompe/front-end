import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const footerColumns = [
  {
    title: 'Layanan Pelanggan',
    links: [
      { label: 'Hubungi Kami', href: '/kontak' },
      { label: 'Pusat Bantuan (FAQ)', href: '/bantuan' },
      { label: 'Pesanan & Pengiriman', href: '/pesanan-pengiriman' },
      { label: 'Pengembalian & Komplain', href: '/pengembalian' },
      { label: 'Pembayaran & Harga', href: '/pembayaran' },
      { label: 'Ketentuan Promo', href: '/ketentuan-promo' },
      { label: 'Jaminan Kesegaran PanganTani', href: '/jaminan-kesegaran' },
    ],
  },
  {
    title: 'Tentang PanganTani',
    links: [
      { label: 'Tentang Kami', href: '/tentang' },
      { label: 'Siaran Pers', href: '/pers' },
      { label: 'Mitra Petani & Kelompok Tani', href: '/kemitraan' },
      { label: 'Karier', href: '/karier' },
      { label: 'Aplikasi PanganTani', href: '/aplikasi' },
      { label: 'Keberlanjutan & Ketahanan Pangan', href: '/keberlanjutan' },
      { label: 'Peta Situs', href: '/sitemap' },
    ],
  },
  {
    title: 'Program & Kemitraan',
    links: [
      { label: 'Program Mitra Petani', href: '/mitra-petani' },
      { label: 'Ajak Teman', href: '/referral' },
      { label: 'Keanggotaan PanganTani', href: '/keanggotaan' },
      { label: 'Kemitraan Distributor & Resto', href: '/mitra-bisnis' },
      { label: 'Papan Kebutuhan Pangan', href: '/papan-kebutuhan' },
      { label: 'Pasar Panen Musiman', href: '/pasar' },
    ],
  },
]

const legalLinks = [
  { label: 'Kebijakan Privasi', href: '/privasi' },
  { label: 'Syarat & Ketentuan', href: '/syarat' },
  { label: 'Aksesibilitas', href: '/aksesibilitas' },
]

function InstagramIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5' />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17' />
      <path d='m10 15 5-3-5-3z' />
    </svg>
  )
}

const socialLinks = [
  { label: 'Instagram PanganTani', href: 'https://instagram.com/pangantani', icon: InstagramIcon },
  { label: 'TikTok PanganTani', href: 'https://tiktok.com/@pangantani', icon: TikTokIcon },
  { label: 'Facebook PanganTani', href: 'https://facebook.com/pangantani', icon: FacebookIcon },
  { label: 'YouTube PanganTani', href: 'https://youtube.com/@pangantani', icon: YouTubeIcon },
]

const currentYear = new Date().getFullYear()

interface GlobalFooterProps {
  containerClassName?: string
}

export function GlobalFooter({ containerClassName = 'max-w-7xl' }: GlobalFooterProps) {
  return (
    <footer className='border-t border-border bg-secondary text-secondary-foreground'>
      <div className={cn('mx-auto px-4 py-12 sm:px-6 lg:px-8', containerClassName)}>
        <div className='grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4'>
          {footerColumns.map((column) => (
            <div key={column.title} className='flex flex-col gap-3'>
              <h3 className='text-base font-semibold text-secondary-foreground'>{column.title}</h3>
              <ul className='flex flex-col gap-0.5 text-sm text-muted-foreground'>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='inline-flex min-h-10 items-center rounded-sm py-1.5 leading-snug transition-colors pointer-coarse:min-h-11 hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <h3 className='text-base font-semibold text-secondary-foreground'>
                Konten &amp; Layanan
              </h3>
              <ul className='flex flex-col gap-0.5 text-sm text-muted-foreground'>
                <li>
                  <Link
                    href='/edukasi'
                    className='inline-flex min-h-10 items-center rounded-sm py-1.5 leading-snug transition-colors pointer-coarse:min-h-11 hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  >
                    Edukasi Tani: panduan budidaya &amp; panen terbaru
                  </Link>
                </li>
              </ul>
            </div>

            <div className='flex flex-wrap items-center gap-1'>
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={item.label}
                    className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div
        className={cn('mx-auto flex flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8', containerClassName)}
      >
        <nav aria-label='Tautan Kebijakan' className='flex flex-wrap items-center gap-x-6 gap-y-1'>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='inline-flex min-h-10 items-center rounded-sm py-1.5 text-sm text-secondary-foreground underline underline-offset-4 transition-opacity pointer-coarse:min-h-11 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground'>
          <p>
            &apos;PanganTani&apos; dan logo &apos;PanganTani&apos; merupakan merek dagang milik
            PanganTani Indonesia dan dilindungi oleh peraturan perundang-undangan yang berlaku.
          </p>
          <p>&copy; Hak Cipta {currentYear} PanganTani. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
