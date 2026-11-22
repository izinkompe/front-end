import Link from 'next/link'
import { Sprout, ShoppingBag, TrendingUp, BadgeCheck, Plus, ArrowRight, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function FarmerDashboardPage() {
  return (
    <div className='flex flex-col gap-5 sm:gap-6 max-w-7xl mx-auto'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-xl sm:text-2xl font-bold font-heading text-foreground'>
              Ringkasan Kebun & Panen
            </h1>
            <Badge variant='success'>Mitra Terverifikasi</Badge>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            Selamat datang kembali, Budi Santoso (Kelompok Tani Lembang Mandiri)
          </p>
        </div>

        <div className='flex items-center gap-2 pt-1 sm:pt-0'>
          <Link href='/dashboard/komoditas'>
            <Button className='gap-1.5 w-full sm:w-auto'>
              <Plus className='size-3.5' />
              <span>Tambah Panen</span>
            </Button>
          </Link>
          <Link href='/dashboard/pesanan'>
            <Button variant='outline' className='gap-1.5 w-full sm:w-auto'>
              <ShoppingBag className='size-3.5' />
              <span>Daftar Pesanan</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Panen Aktif Ditawarkan</CardDescription>
              <Sprout className='size-4 text-emerald-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>4 Komoditas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Total stok tersedia: 1.250 kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Pesanan Siap Diambil</CardDescription>
              <Clock className='size-4 text-amber-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>3 Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Jadwal serah terima hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Pangan Tersalurkan</CardDescription>
              <TrendingUp className='size-4 text-sky-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>3.850 kg</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Penyelamatan panen surplus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Status Legalitas Akun</CardDescription>
              <BadgeCheck className='size-4 text-primary' />
            </div>
            <CardTitle className='text-lg font-bold text-emerald-600'>Aktif & Sah</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Terverifikasi oleh Tim Admin</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Komoditas Panen Terdaftar</CardTitle>
                <CardDescription>Hasil panen yang saat ini tampil di pasar pangan</CardDescription>
              </div>
              <Link href='/dashboard/komoditas'>
                <Button variant='ghost' className='gap-1'>
                  <span>Kelola Semua</span>
                  <ArrowRight className='size-3' />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className='divide-y divide-border'>
              <div className='flex items-center justify-between py-3'>
                <div className='flex flex-col min-w-0'>
                  <span className='font-semibold text-sm truncate'>Bayam Organik Lembang</span>
                  <span className='text-xs text-muted-foreground'>
                    Grade B / Surplus • Panen: 22 Nov 2026
                  </span>
                </div>
                <div className='flex items-center gap-3 shrink-0'>
                  <span className='font-semibold text-xs sm:text-sm text-foreground'>
                    Rp 8.000 / kg
                  </span>
                  <Badge variant='success'>Tersedia 45 kg</Badge>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div className='flex flex-col min-w-0'>
                  <span className='font-semibold text-sm truncate'>Tomat Ceri Hidroponik</span>
                  <span className='text-xs text-muted-foreground'>
                    Matang Segera • Panen: 21 Nov 2026
                  </span>
                </div>
                <div className='flex items-center gap-3 shrink-0'>
                  <span className='font-semibold text-xs sm:text-sm text-foreground'>
                    Rp 12.000 / kg
                  </span>
                  <Badge variant='warning'>Sisa 18 kg</Badge>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div className='flex flex-col min-w-0'>
                  <span className='font-semibold text-sm truncate'>Singkong Manggu Sukabumi</span>
                  <span className='text-xs text-muted-foreground'>
                    Bentuk Unik • Panen: 20 Nov 2026
                  </span>
                </div>
                <div className='flex items-center gap-3 shrink-0'>
                  <span className='font-semibold text-xs sm:text-sm text-foreground'>
                    Rp 4.500 / kg
                  </span>
                  <Badge variant='success'>Tersedia 300 kg</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat Petani</CardTitle>
            <CardDescription>Pintasan fungsi penting pengelolaan panen</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2'>
            <Link href='/dashboard/komoditas/tambah' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <Plus className='size-4 text-emerald-600' />
                <span>Terbitkan Panen Baru</span>
              </Button>
            </Link>
            <Link href='/dashboard/pesanan' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <ShoppingBag className='size-4 text-sky-600' />
                <span>Konfirmasi Serah Terima Pesanan</span>
              </Button>
            </Link>
            <Link href='/dashboard/kebutuhan' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <TrendingUp className='size-4 text-amber-600' />
                <span>Buka Permintaan Pembeli</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
