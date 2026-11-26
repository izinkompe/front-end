import Link from 'next/link'
import { SURVIVAL_SECTIONS } from './terms-of-use-data'

export function TermsLegalAndGeneralSections() {
  return (
    <>
      <section
        id='transaksi-petani'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          TRANSAKSI LANGSUNG DENGAN PETANI MITRA
        </h2>
        <div id='peran-pangantani' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Peran PanganTani sebagai Fasilitator Pasar Panen
          </h3>
          <p>
            PanganTani berperan sebagai platform fasilitator yang menghubungkan Pembeli dengan
            Petani mitra independen. PanganTani bukan merupakan pemilik lahan pertanian maupun pihak
            yang menanam atau memproduksi hasil panen. Kontrak jual beli hasil panen terbentuk
            antara Anda dan Petani mitra sesuai dengan detail penawaran yang Anda reservasikan.
          </p>
        </div>
        <div id='pengambilan-dan-penimbangan' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Pengambilan di Lokasi dan Penimbangan Aktual
          </h3>
          <p>
            Pengambilan pesanan dilakukan secara mandiri oleh Pembeli di lokasi petani sesuai jadwal
            yang tercantum pada detail pesanan tanpa layanan pengiriman otomatis dari platform.
            Jarak yang ditampilkan pada katalog adalah jarak garis lurus sebagai estimasi awal,
            bukan jarak tempuh rute jalan. Pembeli dan Petani wajib melakukan penimbangan bersama
            saat pengambilan serta mencatat berat aktual pada halaman detail pesanan sebagai dasar
            penyelesaian transaksi atau pengajuan selisih berat.
          </p>
        </div>
      </section>

      <section
        id='penafian-tanggung-jawab'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>PENAFIAN TANGGUNG JAWAB</h2>
        <p>
          SEJAUH DIIZINKAN OLEH HUKUM YANG BERLAKU, LAYANAN, INFORMASI, HARGA, ESTIMATE JARAK, DAN
          KETERSEDIAAN HASIL PANEN DISEDIAKAN &ldquo;SEBAGAIMANA ADANYA&rdquo; TANPA JAMINAN DALAM
          BENTUK APA PUN. PANGAN TANI BERUPAYA MENJAGA KEAKURATAN DATA KATALOG, NAMUN TIDAK MENJAMIN
          BAHWA LAYANAN AKAN SELALU BEBAS DARI GANGGUAN TEKNIS, KETERLAMBATAN JARINGAN, ATAU
          KESALAHAN PENCATATAN STOK DI LAPANGAN.
        </p>
        <p>
          PanganTani berhak mengoreksi kesalahan harga atau ketersediaan yang nyata sebelum
          verifikasi pembayaran disetujui. PanganTani tidak bertanggung jawab atas kerugian tidak
          langsung, kehilangan keuntungan, atau keterlambatan akibat keadaan kahar (force majeure),
          cuaca ekstrem, bencana alam, maupun gangguan distribusi di luar kendali wajar kami.
          Ketentuan ini tidak mengurangi hak-hak konsumen yang bersifat wajib menurut hukum
          perlindungan konsumen Republik Indonesia.
        </p>
      </section>

      <section
        id='ganti-rugi'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>GANTI RUGI</h2>
        <p>
          Anda setuju untuk membela, mengganti rugi, dan membebaskan PanganTani beserta pengelola,
          karyawan, dan mitranya dari setiap klaim, tuntutan, kerugian, biaya, atau pengeluaran
          wajar yang timbul akibat: (i) pelanggaran Anda terhadap Perjanjian ini; (ii) pelanggaran
          Anda terhadap hukum atau hak pihak ketiga mana pun; atau (iii) penyalahgunaan Layanan dan
          Konten yang Anda unggah.
        </p>
      </section>

      <section
        id='tautan-pihak-ketiga'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>TAUTAN KE SITUS PIHAK KETIGA</h2>
        <p>
          Layanan dapat memuat tautan ke situs web atau aplikasi pihak ketiga, misalnya layanan peta
          eksternal untuk membantu navigasi menuju lokasi pengambilan petani. Tautan tersebut
          disediakan semata-mata untuk kemudahan Anda. PanganTani tidak mengendalikan dan tidak
          bertanggung jawab atas isi, kebijakan privasi, maupun praktik situs atau aplikasi pihak
          ketiga tersebut.
        </p>
      </section>

      <section
        id='perangkat-lunak'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          PERANGKAT LUNAK SEBAGAI BAGIAN DARI LAYANAN
        </h2>
        <p>
          Seluruh perangkat lunak, kode sumber, antarmuka pengguna, desain sistem, dan komponen
          digital yang membentuk Layanan dilindungi oleh hukum hak cipta. PanganTani memberikan
          lisensi terbatas, pribadi, tidak eksklusif, dan tidak dapat dipindahtangankan kepada Anda
          untuk mengakses dan menggunakan Layanan sesuai Perjanjian ini.
        </p>
      </section>

      <section
        id='hak-cipta'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          PEMBERITAHUAN HAK CIPTA DAN MEREK DAGANG
        </h2>
        <p>
          Nama PanganTani, logo, tampilan antarmuka, ikon, dan elemen merek lainnya merupakan merek
          dagang atau kekayaan intelektual milik PanganTani dan tidak boleh disalin, ditiru, atau
          digunakan tanpa izin tertulis sebelumnya.
        </p>
        <div id='prosedur-pengaduan-konten' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Prosedur Pelaporan dan Penurunan Konten Ilegal
          </h3>
          <p>
            PanganTani beroperasi dengan prinsip pemberitahuan dan penurunan konten (notice and
            takedown). Apabila Anda menemukan Konten yang melanggar hak cipta, memalsukan identitas,
            atau melanggar hukum, harap segera laporkan melalui kanal bantuan resmi kami agar dapat
            ditinjau dan ditindaklanjuti dalam waktu yang wajar.
          </p>
        </div>
      </section>

      <section
        id='perubahan-dan-penghentian'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          PERUBAHAN PERJANJIAN; PEMBARUAN LAYANAN; PENGHENTIAN
        </h2>
        <p>
          PanganTani dapat mengubah, menambah, atau memperbarui ketentuan dalam Perjanjian ini dari
          waktu ke waktu untuk menyesuaikan dengan perkembangan hukum, kebijakan operasional, atau
          pembaruan fitur. Kami juga dapat melakukan pemeliharaan sistem, perbaikan bug, atau
          penghentian sebagian Layanan untuk menjaga keamanan dan keandalan platform. PanganTani
          berhak membatasi atau menghentikan akses akun yang terbukti melanggar Perjanjian ini untuk
          melindungi pengguna lain dan integritas transaksi.
        </p>
      </section>

      <section
        id='hukum-yang-berlaku'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>YURISDIKSI DAN HUKUM YANG MENGATUR</h2>
        <p>
          Perjanjian ini dan setiap sengketa atau klaim yang timbul dari atau sehubungan dengan
          penggunaan Layanan diatur dan ditafsirkan berdasarkan hukum Republik Indonesia. Setiap
          perselisihan diupayakan terlebih dahulu melalui penyelesaian musyawarah dan mekanisme
          pengaduan internal PanganTani. Apabila tidak tercapai kesepakatan, sengketa diselesaikan
          melalui pengadilan yang berwenang di wilayah hukum Republik Indonesia.
        </p>
      </section>

      <section
        id='ketentuan-umum'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>KETENTUAN UMUM</h2>
        <p>
          Perjanjian ini tidak menciptakan hubungan kemitraan usaha patungan, keagenan, atau
          hubungan ketenagakerjaan antara Anda dan PanganTani. Apabila terdapat ketentuan dalam
          Perjanjian ini yang dinyatakan tidak sah atau tidak dapat dilaksanakan oleh hukum yang
          berlaku, ketentuan tersebut digantikan oleh ketentuan sah yang paling mendekati maksud
          aslinya, sedangkan ketentuan lainnya tetap berlaku penuh.
        </p>
        <p>
          Anda dilarang mengalihkan hak atau kewajiban Anda berdasarkan Perjanjian ini kepada pihak
          lain tanpa persetujuan tertulis dari PanganTani. Bagian-bagian berikut akan tetap berlaku
          meskipun akun atau Perjanjian ini berakhir:
        </p>
        <ul className='list-disc space-y-1.5 pl-6'>
          {SURVIVAL_SECTIONS.map((sectionTitle) => (
            <li key={sectionTitle}>{sectionTitle}</li>
          ))}
        </ul>
      </section>

      <section
        id='bantuan-layanan'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>BANTUAN LAYANAN</h2>
        <p>
          Untuk pertanyaan mengenai pemesanan, pembayaran transfer, pengambilan hasil panen, atau
          keberatan atas transaksi, silakan kunjungi{' '}
          <Link href='/bantuan' className='font-medium text-primary underline underline-offset-4'>
            Pusat Bantuan
          </Link>
          , ajukan laporan melalui{' '}
          <Link
            href='/akun/pengaduan'
            className='font-medium text-primary underline underline-offset-4'
          >
            Pengaduan Saya
          </Link>
          , atau hubungi kami melalui email resmi di{' '}
          <a
            href='mailto:bantuan@pangantani.id'
            className='font-medium text-primary underline underline-offset-4'
          >
            bantuan@pangantani.id
          </a>
          .
        </p>
      </section>
    </>
  )
}
