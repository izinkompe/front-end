import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BuyerHeroSearch } from './buyer-hero-search'
import { buyerHeroCategories } from './hero-search-params'

export function BuyerHeroSection() {
  return (
    <section aria-labelledby='buyer-hero-heading' className='w-full bg-background'>
      <div className='relative w-full overflow-hidden bg-zinc-900'>
        <Image
          src='/images/hero.webp'
          alt=''
          fill
          loading='eager'
          fetchPriority='high'
          preload
          sizes='100vw'
          className='object-cover object-center'
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-linear-to-b from-black/65 via-black/45 to-black/55'
        />

        <div className='relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-7 px-4 pt-24 pb-12 sm:gap-8 sm:px-6 sm:pt-28 sm:pb-16 lg:px-8 lg:pt-36 lg:pb-20'>
          <div className='mx-auto flex max-w-3xl flex-col items-center gap-2 text-center'>
            <h1
              id='buyer-hero-heading'
              className='text-[clamp(1.625rem,1.25rem+1.5vw,2.5rem)] leading-tight font-normal text-white drop-shadow-xs'
            >
              Halo, <span className='font-bold'>mau cari panen apa hari ini?</span>
            </h1>
            <p className='text-base leading-relaxed text-white/90'>
              PanganTani - Beli hasil panen surplus lokal langsung dari petani sekitar Anda.
            </p>
          </div>

          <BuyerHeroSearch />
        </div>
      </div>

      <div className='mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between'>
          <nav
            aria-label='Pintasan kategori komoditas'
            className='flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2 sm:pb-0'
          >
            {buyerHeroCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className='rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                {category.label}
              </Link>
            ))}
          </nav>

          <Button
            variant='outline'
            className='w-full sm:w-auto'
            nativeButton={false}
            render={<Link href='/papan-kebutuhan' />}
          >
            Pasang di Papan Kebutuhan
          </Button>
        </div>
      </div>
    </section>
  )
}
