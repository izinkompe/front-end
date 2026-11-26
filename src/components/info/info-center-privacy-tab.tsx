import Link from 'next/link'
import { AccountLink } from '@/components/auth/account-link'

export function InfoCenterPrivacyTab() {
  return (
    <div className='flex flex-col gap-8'>
      <section className='flex flex-col gap-3'>
        <p>
          Kebijakan Privasi ini menjelaskan bagaimana PanganTani mengumpulkan, menggunakan,
          menyimpan, dan melindungi informasi pribadi yang Anda berikan saat mengakses katalog{' '}
          <Link href='/pasar' className='font-medium text-primary underline underline-offset-4'>
            Pasar Panen
          </Link>
          , membuat reservasi, maupun mengelola akun pembeli dan petani mitra.
        </p>
      </section>

      <section
        id='data-akun-pesanan'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Data akun dan pesanan</h2>
        <p>
          Nama, kontak, dan alamat yang Anda isi membantu mengelola pesanan dan pengambilan. Katalog
          menampilkan wilayah pengambilan secara umum. Pembeli dapat melihat alamat lengkap petani
          setelah reservasi dibuat untuk menjaga privasi lokasi lahan petani.
        </p>
      </section>

      <section
        id='bukti-transaksi-pengaduan'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Bukti transaksi dan pengaduan</h2>
        <p>
          Administrator meninjau bukti pembayaran transfer manual serta foto kondisi panen pada
          laporan pengaduan. Jika laporan memerlukan pengembalian dana, rekening bank yang Anda isi
          menjadi tujuan transfer manual. Data transaksi disimpan untuk keperluan verifikasi, audit,
          dan penyelesaian sengketa.
        </p>
      </section>

      <section
        id='preferensi-perangkat'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Preferensi di perangkat</h2>
        <p>
          Peramban menyimpan pengaturan{' '}
          <Link
            href='/pusat-informasi?tab=aksesibilitas'
            className='font-medium text-primary underline underline-offset-4'
          >
            aksesibilitas
          </Link>{' '}
          dan penawaran yang terakhir Anda lihat. Versi demo juga menyimpan daftar favorit dan
          pengaturan pengingat di penyimpanan lokal peramban.
        </p>
      </section>

      <section
        id='hak-pengguna-privasi'
        className='flex scroll-mt-24 flex-col gap-3 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>Pembaruan data dan kontak privasi</h2>
        <p>
          Anda dapat memperbarui informasi profil dan daftar alamat kapan saja melalui halaman{' '}
          <AccountLink
            href='/akun/profil'
            className='font-medium text-primary underline underline-offset-4'
          >
            Profil Saya
          </AccountLink>
          . Untuk pertanyaan mengenai pengelolaan data pribadi, hubungi tim kami melalui{' '}
          <a
            href='mailto:bantuan@pangantani.id'
            className='font-medium text-primary underline underline-offset-4'
          >
            bantuan@pangantani.id
          </a>
          .
        </p>
      </section>
    </div>
  )
}
