'use client'

import Link from 'next/link'
import { CheckCircle2, Clock, FileEdit, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StepWelcomeProps {
  farmerName: string
  farmName: string
}

export function StepWelcome({ farmerName, farmName }: StepWelcomeProps) {
  return (
    <div className='flex flex-col items-center gap-6 pt-4 text-center'>
      <div className='flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <CheckCircle2 className='size-8' aria-hidden='true' />
      </div>

      <div className='flex flex-col items-center gap-2.5'>
        <Badge variant='secondary'>
          <Clock data-icon='inline-start' />
          <span>Status Verifikasi: Sedang Ditinjau Admin</span>
        </Badge>
        <h1 className='type-h1 font-semibold text-foreground'>
          Selamat datang di PanganTani, {farmerName}!
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Pendaftaran untuk <span className='font-medium text-foreground'>{farmName}</span> sudah
          kami terima dan sedang diperiksa oleh tim Admin.
        </p>
      </div>

      <Card className='w-full text-left'>
        <CardHeader>
          <CardTitle>Apa yang bisa Anda lakukan sekarang?</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 text-base leading-relaxed text-muted-foreground'>
          <div className='flex items-start gap-3'>
            <FileEdit className='mt-1 size-4.5 shrink-0 text-primary' aria-hidden='true' />
            <p>
              <span className='font-medium text-foreground'>Bisa langsung dilakukan:</span> Masuk ke
              Dasbor Petani untuk mulai menyiapkan dan menyimpan{' '}
              <span className='font-medium text-foreground'>draf penawaran hasil panen</span>.
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <Lock className='mt-1 size-4.5 shrink-0 text-muted-foreground' aria-hidden='true' />
            <p>
              <span className='font-medium text-foreground'>Aktif setelah disetujui Admin:</span>{' '}
              Tombol <span className='font-medium text-foreground'>Terbitkan Penawaran</span> dan{' '}
              <span className='font-medium text-foreground'>Tanggapi Papan Kebutuhan Pangan</span>{' '}
              akan terbuka otomatis begitu verifikasi selesai.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        size='lg'
        className='w-full rounded-full'
        nativeButton={false}
        render={<Link href='/dashboard' />}
      >
        Lanjutkan ke Dasbor Petani
      </Button>
    </div>
  )
}
