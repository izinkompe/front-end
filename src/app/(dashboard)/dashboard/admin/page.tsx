import Link from 'next/link'
import {
  ShieldCheck,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Leaf,
  FileDown,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  return (
    <div className='flex flex-col gap-5 sm:gap-6 max-w-7xl mx-auto'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-xl sm:text-2xl font-bold font-heading text-foreground'>
              Pusat Kendali Administrator
            </h1>
            <Badge variant='info' className='gap-1'>
              <ShieldCheck className='size-3.5' />
              <span>Admin Operasional</span>
            </Badge>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            Selamat datang, Siti Rahma — Tim Verifikasi & Pengawasan Distribusi PanganTani
          </p>
        </div>

        <div className='flex items-center gap-2 pt-1 sm:pt-0'>
          <Link href='/dashboard/admin/verifikasi-pembayaran'>
            <Button className='gap-1.5 w-full sm:w-auto'>
              <CreditCard className='size-3.5' />
              <span>Verifikasi Bayar</span>
            </Button>
          </Link>
          <Link href='/dashboard/admin/laporan'>
            <Button variant='outline' className='gap-1.5 w-full sm:w-auto'>
              <FileDown className='size-3.5' />
              <span>Ekspor CSV</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Pangan Tersalurkan</CardDescription>
              <TrendingUp className='size-4 text-emerald-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>14.250 kg</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Dihitung tepat 1x transaksi selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Jejak Karbon Dicegah</CardDescription>
              <Leaf className='size-4 text-emerald-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>28.320 kg</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Setara CO₂e berdasarkan faktor emisi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Antrean Pembayaran</CardDescription>
              <CreditCard className='size-4 text-amber-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>2 Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Bukti transfer perlu peninjauan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription>Pengaduan Terbuka</CardDescription>
              <AlertTriangle className='size-4 text-destructive' />
            </div>
            <CardTitle className='text-2xl font-bold'>1 Sengketa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Selisih berat butuh mediasi</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Antrean Tugas Mendesak</CardTitle>
            <CardDescription>
              Aksi yang memerlukan keputusan Administrator segera (FR-AD-01 s/d FR-AD-04)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='divide-y divide-border'>
              <div className='flex items-center justify-between py-3 gap-2'>
                <div className='flex flex-col min-w-0'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='warning'>Pembayaran</Badge>
                    <span className='font-semibold text-sm truncate'>
                      Pesanan #ORD-2026-089 (Dapur Kasih)
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground mt-0.5'>
                    Bukti transfer Rp 1.200.000 • Sisa tenggat: 18 menit
                  </span>
                </div>
                <Link href='/dashboard/admin/verifikasi-pembayaran' className='shrink-0'>
                  <Button variant='outline' className='gap-1'>
                    <span>Tinjau</span>
                    <ArrowRight className='size-3' />
                  </Button>
                </Link>
              </div>

              <div className='flex items-center justify-between py-3 gap-2'>
                <div className='flex flex-col min-w-0'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='info'>Petani Baru</Badge>
                    <span className='font-semibold text-sm truncate'>
                      Kelompok Tani Harapan Jaya (Ciwidey)
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground mt-0.5'>
                    Pengajuan berkas KTP & lahan baru • Diajukan 2 jam lalu
                  </span>
                </div>
                <Link href='/dashboard/admin/verifikasi-petani' className='shrink-0'>
                  <Button variant='outline' className='gap-1'>
                    <span>Periksa</span>
                    <ArrowRight className='size-3' />
                  </Button>
                </Link>
              </div>

              <div className='flex items-center justify-between py-3 gap-2'>
                <div className='flex flex-col min-w-0'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='destructive'>Pengaduan</Badge>
                    <span className='font-semibold text-sm truncate'>
                      Selisih Berat #ORD-2026-081 (Resto Sedap)
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground mt-0.5'>
                    Diterima 8 kg dari pesanan 10 kg • Perlu penetapan berat akhir
                  </span>
                </div>
                <Link href='/dashboard/admin/pengaduan' className='shrink-0'>
                  <Button variant='outline' className='gap-1'>
                    <span>Mediasi</span>
                    <ArrowRight className='size-3' />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigasi Modul Admin</CardTitle>
            <CardDescription>Akses cepat seluruh domain fungsional</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2'>
            <Link href='/dashboard/admin/verifikasi-pembayaran' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <CreditCard className='size-4 text-amber-600' />
                <span>Verifikasi Pembayaran Manual</span>
              </Button>
            </Link>
            <Link href='/dashboard/admin/verifikasi-petani' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <UserCheck className='size-4 text-sky-600' />
                <span>Verifikasi Berkas Petani Mitra</span>
              </Button>
            </Link>
            <Link href='/dashboard/admin/pengaduan' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <AlertTriangle className='size-4 text-destructive' />
                <span>Pengaduan & Transaksi Bermasalah</span>
              </Button>
            </Link>
            <Link href='/dashboard/admin/emisi-karbon' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <Leaf className='size-4 text-emerald-600' />
                <span>Faktor & Metodologi Jejak Karbon</span>
              </Button>
            </Link>
            <Link href='/dashboard/admin/laporan' className='w-full'>
              <Button variant='outline' className='w-full justify-start gap-2'>
                <FileDown className='size-4 text-foreground' />
                <span>Ekspor Laporan Distribusi CSV</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
