import { Skeleton } from '@/components/ui/skeleton'

export function FarmerStoreSkeleton() {
  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
      <Skeleton className='h-5 w-64' />

      <div className='rounded-2xl border border-border bg-card p-6'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-start gap-4'>
            <Skeleton className='size-20 shrink-0 rounded-full' />
            <div className='flex flex-col gap-2.5'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-4 w-48' />
              <div className='flex gap-2'>
                <Skeleton className='h-9 w-28' />
                <Skeleton className='h-9 w-28' />
                <Skeleton className='size-9' />
              </div>
            </div>
          </div>

          <div className='flex gap-6'>
            <Skeleton className='h-12 w-32' />
            <Skeleton className='h-12 w-28' />
          </div>
        </div>
      </div>

      <div className='flex gap-4 border-b border-border pb-2'>
        <Skeleton className='h-9 w-28' />
        <Skeleton className='h-9 w-28' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]'>
        <Skeleton className='hidden h-64 rounded-2xl lg:block' />
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          <Skeleton className='h-80 rounded-2xl' />
          <Skeleton className='h-80 rounded-2xl' />
          <Skeleton className='h-80 rounded-2xl' />
        </div>
      </div>
    </div>
  )
}
