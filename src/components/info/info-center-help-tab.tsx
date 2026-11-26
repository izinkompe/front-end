import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InfoCenterHelpTab() {
  return (
    <div className='flex flex-col gap-8'>
      <nav aria-label='Topik bantuan' className='flex flex-wrap gap-2'>
        <Button variant='outline' size='sm' nativeButton={false} render={<a href='#pesanan' />}>
          Pesanan
        </Button>
        <Button variant='outline' size='sm' nativeButton={false} render={<a href='#pembayaran' />}>
          Pembayaran
        </Button>
        <Button variant='outline' size='sm' nativeButton={false} render={<a href='#pengambilan' />}>
          Pengambilan
        </Button>
        <Button
          variant='outline'
          size='sm'
          nativeButton={false}
          render={<a href='#pengembalian' />}
        >
          Pengaduan dan pengembalian
        </Button>
      </nav>

      <section
        id='pesanan'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Pesan hasil panen</h2>
        <p>
          Pilih satu penawaran di{' '}
          <Link href='/pasar' className='font-medium text-primary underline underline-offset-4'>
            Pasar Panen
          </Link>
          , masukkan berat dalam kilogram (ketelitian hingga 0,001 kg), lalu pilih jadwal
          pengambilan. Jika harga berubah sebelum reservasi, tinjau total terbaru sebelum
          melanjutkan.
        </p>
      </section>

      <section
        id='pembayaran'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Bayar lewat transfer</h2>
        <p>
          Transfer sesuai nominal dan rekening tujuan pada tagihan. Unggah bukti JPEG atau PNG
          maksimal 5 MB dalam 30 menit setelah reservasi. Administrator memeriksa bukti. Jika
          ditolak, unggah ulang sebelum tenggat.
        </p>
      </section>

      <section
        id='pengambilan'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Ambil dan timbang panen</h2>
        <p>
          Buka detail pesanan untuk melihat alamat, petunjuk lokasi, jadwal, dan kartu pengambilan.
          Ambil panen langsung di lokasi petani. Timbang hasilnya bersama petani dan catat berat
          aktual pada halaman detail pesanan.
        </p>
      </section>

      <section
        id='pengembalian'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          Ajukan pengaduan dan pengembalian dana
        </h2>
        <p>
          Buka{' '}
          <Link href='/akun' className='font-medium text-primary underline underline-offset-4'>
            Pesanan Saya
          </Link>{' '}
          untuk mengajukan pembatalan pasca-bayar atau melaporkan masalah. Administrator meninjau
          laporan. Pantau tanggapan, klarifikasi, dan pengembalian dana di{' '}
          <Link
            href='/akun/pengaduan'
            className='font-medium text-primary underline underline-offset-4'
          >
            Pengaduan Saya
          </Link>
          .
        </p>
        <p>
          Jika administrator menyetujui pengembalian dana, transfer dilakukan secara manual ke
          rekening tujuan yang tercantum pada laporan.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Butuh bantuan terkait pesanan aktif?</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Button size='sm' nativeButton={false} render={<Link href='/akun' />}>
            Buka Pesanan Saya
          </Button>
          <Button
            variant='outline'
            size='sm'
            nativeButton={false}
            render={<Link href='/akun/pengaduan' />}
          >
            Lihat Pengaduan Saya
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
