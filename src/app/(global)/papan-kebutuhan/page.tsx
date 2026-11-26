import { Suspense } from 'react'
import { NeedsBoardView } from '@/components/needs-board/needs-board-view'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Papan Kebutuhan Pangan' }

export default function NeedsBoardPage() {
  return (
    <Suspense fallback={<Skeleton className='mx-auto my-8 h-64 w-full max-w-7xl' />}>
      <NeedsBoardView />
    </Suspense>
  )
}
