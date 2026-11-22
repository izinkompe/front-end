import Link from 'next/link'
import { Sprout } from 'lucide-react'

const footerLinks = {
  ekosistem: [
    { label: 'Pasar Pangan', href: '/pasar' },
    { label: 'Edukasi Petani', href: '/edukasi' },
    { label: 'Kemitraan', href: '/kemitraan' },
  ],
  informasi: [
    { label: 'Tentang Kami', href: '/tentang' },
    { label: 'Pusat Bantuan', href: '/bantuan' },
    { label: 'Kontak', href: '/kontak' },
  ],
  kebijakan: [
    { label: 'Syarat & Ketentuan', href: '/syarat' },
    { label: 'Kebijakan Privasi', href: '/privasi' },
  ],
}

const currentYear = new Date().getFullYear()

export function GlobalFooter() {
  return (
    <footer className='border-t border-border bg-muted/40 text-foreground'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          <div className='space-y-4'>
            <Link
              href='/'
              className='flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-90 transition-opacity'
            >
              <span className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <Sprout className='size-5' />
              </span>
              <span>PanganTani</span>
            </Link>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Mendukung ketahanan pangan melalui kolaborasi langsung antara petani, distributor, dan
              konsumen.
            </p>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-foreground mb-3'>Ekosistem</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {footerLinks.ekosistem.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-foreground mb-3'>Informasi</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {footerLinks.informasi.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-foreground mb-3'>Kebijakan</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {footerLinks.kebijakan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground'>
          <p>&copy; {currentYear} PanganTani. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
