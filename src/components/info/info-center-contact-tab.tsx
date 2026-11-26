import Link from 'next/link'
import { Clock, Mail, MapPin, MessageSquareWarning, Sprout } from 'lucide-react'
import { AccountLink } from '@/components/auth/account-link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InfoCenterContactTab() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Mail className='size-5 text-primary' aria-hidden='true' />
              Layanan Pembeli &amp; Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 text-sm text-muted-foreground'>
            <p>
              Untuk kendala reservasi, verifikasi bukti transfer manual, perubahan jadwal
              pengambilan, atau pertanyaan seputar akun pembeli.
            </p>
            <div className='flex flex-col gap-1.5 text-foreground'>
              <p>
                Email:{' '}
                <a
                  href='mailto:bantuan@pangantani.id'
                  className='font-medium text-primary underline underline-offset-4'
                >
                  bantuan@pangantani.id
                </a>
              </p>
              <p className='flex items-center gap-1.5 text-muted-foreground'>
                <Clock className='size-4 shrink-0 text-primary' aria-hidden='true' />
                Senin – Sabtu, 08.00 – 17.00 WIB
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button size='sm' nativeButton={false} render={<AccountLink href='/akun' />}>
                Pesanan Saya
              </Button>
              <Button
                variant='outline'
                size='sm'
                nativeButton={false}
                render={<AccountLink href='/akun/pengaduan' />}
              >
                <MessageSquareWarning data-icon='inline-start' aria-hidden='true' />
                Pengaduan Saya
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Sprout className='size-5 text-primary' aria-hidden='true' />
              Kemitraan Petani &amp; Lembaga
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 text-sm text-muted-foreground'>
            <p>
              Untuk pendaftaran petani mitra baru, verifikasi kebun, kerja sama koperasi tani, serta
              permintaan informasi resmi dan pelaporan konten.
            </p>
            <div className='flex flex-col gap-1.5 text-foreground'>
              <p>
                Email:{' '}
                <a
                  href='mailto:mitra@pangantani.id'
                  className='font-medium text-primary underline underline-offset-4'
                >
                  mitra@pangantani.id
                </a>
              </p>
              <p className='text-muted-foreground'>
                Respons kemitraan diproses pada hari kerja dalam 1–2 hari kerja.
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button size='sm' nativeButton={false} render={<Link href='/daftar-petani' />}>
                Daftar sebagai Petani
              </Button>
              <Button
                variant='outline'
                size='sm'
                nativeButton={false}
                render={<Link href='/masuk-petani' />}
              >
                Masuk Akun Petani
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className='flex flex-col gap-3 border-t border-border pt-6'>
        <h2 className='flex items-center gap-2 text-xl font-bold text-foreground'>
          <MapPin className='size-5 text-primary' aria-hidden='true' />
          Korespondensi Resmi PanganTani
        </h2>
        <p>
          PanganTani Indonesia beroperasi untuk menghubungkan petani dan pembeli hasil panen di
          berbagai wilayah Indonesia. Surat-menyurat resmi dan permintaan informasi hukum dapat
          ditujukan ke alamat email{' '}
          <a
            href='mailto:bantuan@pangantani.id'
            className='font-medium text-primary underline underline-offset-4'
          >
            bantuan@pangantani.id
          </a>{' '}
          dengan subjek yang jelas.
        </p>
        <p className='text-sm text-muted-foreground'>
          Demi keamanan akun Anda, tim PanganTani tidak pernah meminta kata sandi, kode verifikasi,
          atau transfer ke rekening di luar tagihan resmi yang tertera pada halaman detail pesanan.
        </p>
      </section>
    </div>
  )
}
