import Image from 'next/image'
import { BuyerHeroSearch } from './buyer-hero-search'

export function BuyerHeroSection() {
  return (
    <section className='w-full bg-background'>
      <div className='relative w-full bg-zinc-900'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
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
          <div className='absolute inset-0 bg-linear-to-b from-black/75 via-black/60 to-black/45' />
        </div>

        <div className='relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 pt-32 pb-10 sm:gap-8 sm:px-6 sm:pt-36 sm:pb-16 lg:px-8 lg:pt-40 lg:pb-20'>
          <div className='mx-auto flex max-w-3xl flex-col items-center gap-2.5 text-center'>
            <h1
              id='buyer-hero-heading'
              className='type-display font-normal text-white drop-shadow-xs'
            >
              Halo, <span className='font-bold'>mau cari panen apa hari ini?</span>
            </h1>
            <p className='type-lead max-w-[60ch] text-white'>
              Beli hasil panen surplus langsung dari petani sekitar Anda, harga per kilogram dan
              ambil mandiri.
            </p>
          </div>

          <BuyerHeroSearch />
        </div>
      </div>
    </section>
  )
}
