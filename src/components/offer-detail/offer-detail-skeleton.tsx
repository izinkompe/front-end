import { Skeleton } from '@/components/ui/skeleton'

export function OfferDetailSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat detail komoditas'
      className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <Skeleton className='h-4 w-64 max-w-full' />
        <Skeleton className='h-6 w-32' />
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_410px] xl:gap-10'>
        <div className='flex min-w-0 flex-col gap-10'>
          <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-7'>
            <Skeleton className='aspect-4/3 w-full rounded-2xl md:aspect-square' />

            <div className='flex flex-col gap-4'>
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-28 rounded-full' />
                <Skeleton className='h-6 w-32 rounded-full' />
              </div>
              <Skeleton className='h-8 w-72 max-w-full' />
              <Skeleton className='h-7 w-40' />
              <Skeleton className='h-10 w-full' />
              <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-5 w-36' />
                <Skeleton className='h-5 w-36' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='flex gap-2 pt-1'>
                <Skeleton className='h-9 w-24 rounded-full' />
                <Skeleton className='h-9 w-24 rounded-full' />
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-7'>
            <div className='flex gap-2'>
              <Skeleton className='h-9 w-24 rounded-full' />
              <Skeleton className='h-9 w-28 rounded-full' />
              <Skeleton className='h-9 w-24 rounded-full' />
            </div>
            <div className='flex flex-col gap-3'>
              <Skeleton className='h-7 w-56' />
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-5/6' />
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Skeleton className='h-16 rounded-xl' />
              <Skeleton className='h-16 rounded-xl' />
              <Skeleton className='h-16 rounded-xl' />
              <Skeleton className='h-16 rounded-xl' />
            </div>
          </div>
        </div>

        <Skeleton className='hidden h-120 w-full rounded-xl lg:block' />
      </div>
    </div>
  )
}
