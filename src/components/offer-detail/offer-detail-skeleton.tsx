import { Skeleton } from '@/components/ui/skeleton'

export function OfferDetailSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat detail komoditas'
      className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
    >
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-4 w-64 max-w-full' />
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex flex-1 flex-col gap-2.5'>
            <div className='flex gap-2'>
              <Skeleton className='h-7 w-28 rounded-full' />
              <Skeleton className='h-7 w-32 rounded-full' />
            </div>
            <Skeleton className='h-9 w-80 max-w-full' />
            <Skeleton className='h-5 w-72 max-w-full' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-24 rounded-lg' />
            <Skeleton className='h-10 w-24 rounded-lg' />
          </div>
        </div>
      </div>

      <Skeleton className='aspect-16/9 max-h-112 w-full rounded-2xl' />

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-10'>
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

        <Skeleton className='h-112 w-full rounded-xl' />
      </div>
    </div>
  )
}
