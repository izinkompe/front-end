'use client'

import Link from 'next/link'
import { ComplaintDetailPanel } from '@/components/complaints/complaint-detail-panel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useComplaints } from '@/hooks/api/use-complaints'

export function AccountComplaintsView() {
  const { data, isLoading, isError, refetch } = useComplaints()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Pengaduan saya</CardTitle>
        <CardDescription>
          Pantau laporan kendala pesanan, permintaan pembatalan, klarifikasi, dan status
          pengembalian dana.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-5'>
        {isLoading && <Skeleton className='h-36 w-full' />}

        {isError && (
          <Alert variant='destructive'>
            <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
              <span>Pengaduan gagal dimuat.</span>
              <Button variant='outline' size='sm' onClick={() => refetch()}>
                Muat ulang
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {data?.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada pengaduan</EmptyTitle>
              <EmptyDescription>
                Anda dapat melaporkan kendala atau mengajukan pembatalan langsung dari halaman
                detail pesanan.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant='outline' nativeButton={false} render={<Link href='/akun' />}>
                Lihat pesanan saya
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {data?.map((report) => (
          <ComplaintDetailPanel key={report.id} report={report} showOrder />
        ))}
      </CardContent>
    </Card>
  )
}
