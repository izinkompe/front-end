import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CheckoutSkeleton() {
  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
      <div className='flex flex-col gap-3'>
        <Skeleton className='h-8 w-56' />
        <Skeleton className='h-6 w-80 max-w-full' />
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]'>
        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-72 max-w-full' />
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-20 w-full' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-52' />
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-11 w-full' />
            </CardContent>
          </Card>
        </div>

        <Card className='h-fit'>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex gap-3'>
              <Skeleton className='size-16 rounded-lg' />
              <div className='flex flex-1 flex-col gap-2'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-6 w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
