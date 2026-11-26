import Image from 'next/image'
import { BuyerHeroSearch } from './buyer-hero-search'

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
          className='pointer-events-none absolute inset-0 bg-linear-to-b from-black/65 via-black/45 to-black/35'
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
    </section>
  )
}
