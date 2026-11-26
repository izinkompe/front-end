import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export default function FarmerStoreNotFound() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6'>
      <Empty className='border border-border bg-card py-12'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Sprout />
          </EmptyMedia>
          <EmptyTitle>Profil kebun petani tidak ditemukan</EmptyTitle>
          <EmptyDescription>
            Tautan kebun petani tidak tersedia atau akun tidak terdaftar sebagai mitra petani.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size='sm' nativeButton={false} render={<Link href='/pasar' />}>
            Jelajahi Pasar Panen
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
