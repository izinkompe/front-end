import { Skeleton } from '@/components/ui/skeleton'

export function CatalogCardsGridSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat kartu komoditas'
      className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
        <div
          key={item}
          className='flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card'
        >
          <Skeleton className='aspect-4/3 w-full rounded-none' />
          <div className='flex flex-col gap-3 p-4'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-6 w-4/5' />
            <div className='flex items-end justify-between gap-2 pt-1'>
              <Skeleton className='h-9 w-28' />
              <Skeleton className='h-7 w-24' />
            </div>
            <Skeleton className='h-4 w-full' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CatalogLoadingSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat daftar penawaran panen'
      className='mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'
    >
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-9 w-72' />
        <Skeleton className='h-5 w-96 max-w-full' />
      </div>
      <Skeleton className='h-14 w-full rounded-xl' />
      <CatalogCardsGridSkeleton />
    </div>
  )
}
