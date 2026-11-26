import Link from 'next/link'
import {
  PROHIBITED_ACTIVITIES,
  PROHIBITED_CONTENT_RULES,
  TRANSACTION_RULES_ROWS,
} from './terms-of-use-data'

export function TermsIntroAndUsageSections() {
  return (
    <>
      <section aria-label='Pendahuluan perjanjian' className='flex flex-col gap-4'>
        <p>
          Selamat datang di situs web dan layanan digital PanganTani yang dapat diakses melalui
          platform resmi PanganTani, termasuk katalog{' '}
          <Link href='/pasar' className='font-medium text-primary underline underline-offset-4'>
            Pasar Panen
          </Link>
          ,{' '}
          <Link
            href='/papan-kebutuhan'
            className='font-medium text-primary underline underline-offset-4'
          >
            Papan Kebutuhan Pangan
          </Link>
          , fitur akun pembeli dan petani, korespondensi email, serta notifikasi layanan (secara
          bersama-sama disebut sebagai &ldquo;Layanan&rdquo;). Layanan ini dikelola dan disediakan
          oleh PanganTani Indonesia (&ldquo;PanganTani&rdquo;, &ldquo;kami&rdquo;, atau &ldquo;milik
          kami&rdquo;).
        </p>
        <p>
          Dengan membuat akun PanganTani, mengajukan penawaran, atau melakukan reservasi hasil panen
          melalui Layanan, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat
          oleh syarat, ketentuan, dan pemberitahuan yang tercantum di bawah ini (secara kolektif
          disebut sebagai &ldquo;Perjanjian&rdquo;). Harap baca Perjanjian ini dengan saksama karena
          memuat informasi mengenai hak hukum Anda, batasan tanggung jawab, serta ketentuan
          penyelesaian sengketa.
        </p>
        <p>
          Segala informasi, teks, tautan, foto hasil panen, data harga, grafik, atau materi lain
          yang dapat Anda lihat, akses, atau unggah melalui Layanan disebut sebagai
          &ldquo;Konten&rdquo;. Istilah &ldquo;Anda&rdquo; atau &ldquo;Pengguna&rdquo; merujuk pada
          individu, pelaku usaha, badan hukum, pembeli, maupun petani mitra yang membuat akun dan
          menggunakan Layanan. Layanan disediakan secara berkelanjutan untuk:
        </p>
        <ol className='list-outside list-upper-alpha space-y-2 pl-6'>
          <li>
            Membantu pembeli mencari, membandingkan, dan melakukan reservasi hasil panen langsung
            dari petani mitra berdasarkan lokasi, harga, dan jadwal pengambilan; dan
          </li>
          <li>
            Membantu petani mitra menawarkan hasil panen, merespons kebutuhan pangan dari pembeli,
            serta mengelola pengambilan pesanan secara transparan.
          </li>
        </ol>
        <p>
          Penawaran panen, ketersediaan stok, dan harga pada Layanan dapat berubah sewaktu-waktu
          mengikuti kondisi panen aktual di lapangan. PanganTani berhak memperbarui Perjanjian ini
          sewaktu-waktu dan akan mencatat tanggal pembaruan terbaru pada dokumen ini. Apabila Anda
          tidak menyetujui perubahan tersebut, Anda dapat menghentikan penggunaan Layanan dan
          mengajukan penutupan akun.
        </p>
      </section>

      <section
        id='penggunaan-layanan'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>PENGGUNAAN LAYANAN</h2>
        <p>
          Sebagai syarat penggunaan Layanan, Anda menyetujui bahwa (i) seluruh informasi yang Anda
          berikan kepada PanganTani adalah benar, akurat, terkini, dan lengkap; (ii) Anda akan
          menjaga kerahasiaan kredensial akun dan bertanggung jawab penuh atas setiap aktivitas yang
          terjadi melalui akun Anda; serta (iii) Anda berusia sekurang-kurangnya 18 tahun atau telah
          cakap hukum menurut peraturan perundang-undangan di Indonesia untuk mengikatkan diri dalam
          transaksi jual beli.
        </p>
        <p>
          Apabila Anda membuat akun PanganTani untuk kepentingan usaha, restoran, katering,
          koperasi, atau badan hukum lainnya, Anda menyatakan bahwa Anda memiliki kewenangan sah
          untuk mengikat entitas tersebut pada Perjanjian ini, dan setiap rujukan &ldquo;Anda&rdquo;
          berlaku bagi entitas tersebut beserta perwakilannya.
        </p>
        <p>
          PanganTani menyajikan dan mengurutkan daftar penawaran hasil panen menggunakan parameter
          katalog seperti jarak garis lurus dari lokasi Anda ke wilayah petani, harga per kilogram,
          ketersediaan stok, dan jadwal panen terdekat. Penggandaan, transmisi, reproduksi, atau
          distribusi ulang Konten maupun bagian Layanan tanpa izin tertulis dari PanganTani dilarang
          keras.
        </p>
      </section>

      <section
        id='fitur-tambahan'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>FITUR DAN LAYANAN TAMBAHAN</h2>
        <p>
          PanganTani dapat dari waktu ke waktu memperbarui, menambah, atau menghentikan fitur
          tertentu pada Layanan, termasuk namun tidak terbatas pada daftar favorit, pengingat panen,
          dan Papan Kebutuhan Pangan. Penggunaan fitur khusus tertentu—seperti pendaftaran dan
          verifikasi akun Petani—dapat tunduk pada ketentuan tambahan yang ditampilkan pada alur
          terkait dan menjadi bagian tidak terpisahkan dari Perjanjian ini.
        </p>
      </section>

      <section
        id='reservasi-dan-pembayaran'
        className='flex scroll-mt-24 flex-col gap-5 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          KETENTUAN RESERVASI, PEMBAYARAN, DAN PENGEMBALIAN DANA
        </h2>

        <div id='mekanisme-reservasi' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Mekanisme Reservasi dan Penguncian Harga
          </h3>
          <p>
            Satu pesanan di PanganTani berlaku untuk satu penawaran panen dari satu petani. Berat
            pesanan dicatat dalam satuan kilogram (kg) dengan ketelitian hingga tiga angka desimal
            (0,001 kg), dan harga dinyatakan dalam Rupiah per kilogram. Saat reservasi tercatat,
            harga dan stok untuk pesanan Anda dikunci sementara selama batas waktu pembayaran agar
            tidak diambil oleh pembeli lain.
          </p>
        </div>

        <div id='pembayaran-transfer' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Pembayaran Transfer Manual dan Verifikasi
          </h3>
          <p>
            Pembayaran dilakukan melalui transfer bank manual sesuai nominal tagihan dan rekening
            tujuan yang tertera pada detail pesanan. Anda wajib mengunggah bukti transfer berformat
            JPEG atau PNG dengan ukuran maksimal 5 MB dalam waktu 30 menit setelah reservasi dibuat.
            Administrator memeriksa keabsahan bukti pembayaran tersebut. Apabila bukti ditolak, Anda
            dapat mengunggah ulang bukti yang valid sebelum tenggat waktu berakhir.
          </p>
        </div>

        <div id='ringkasan-ketentuan-transaksi' className='flex scroll-mt-24 flex-col gap-3'>
          <h3 className='text-base font-semibold text-foreground'>
            Ringkasan Batasan dan Ketentuan Transaksi
          </h3>
          <div
            tabIndex={0}
            role='region'
            aria-labelledby='tabel-ketentuan-transaksi'
            className='overflow-x-auto rounded-lg border border-border bg-card'
          >
            <table className='w-full min-w-[600px] border-collapse text-left text-sm'>
              <caption
                id='tabel-ketentuan-transaksi'
                className='border-b border-border bg-muted/40 px-4 py-3 text-left text-sm font-semibold text-foreground'
              >
                Ringkasan Aturan Reservasi, Pembayaran Transfer, dan Pengembalian Dana
              </caption>
              <thead>
                <tr className='border-b border-border bg-muted/60'>
                  <th scope='col' className='w-1/4 px-4 py-3 font-semibold text-foreground'>
                    Aspek
                  </th>
                  <th scope='col' className='w-3/8 px-4 py-3 font-semibold text-foreground'>
                    Reservasi &amp; Pembayaran
                  </th>
                  <th scope='col' className='w-3/8 px-4 py-3 font-semibold text-foreground'>
                    Pembatalan &amp; Pengembalian Dana
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {TRANSACTION_RULES_ROWS.map((row) => (
                  <tr key={row.aspect} className='align-top'>
                    <th scope='row' className='px-4 py-3 font-semibold text-foreground'>
                      {row.aspect}
                    </th>
                    <td className='px-4 py-3 text-muted-foreground'>{row.reservationAndPayment}</td>
                    <td className='px-4 py-3 text-muted-foreground'>{row.cancellationAndRefund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id='pembatalan-dan-pengembalian' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Pembatalan Pesanan dan Pengembalian Dana
          </h3>
          <p>
            Pesanan yang belum dibayar dapat dibatalkan secara langsung sebelum batas waktu
            pembayaran berakhir. Jika bukti pembayaran telah dikirim atau diverifikasi, Anda dapat
            mengajukan pembatalan pasca-bayar maupun melaporkan masalah melalui{' '}
            <Link href='/akun' className='font-medium text-primary underline underline-offset-4'>
              Pesanan Saya
            </Link>{' '}
            untuk ditinjau oleh administrator. Status tindak lanjut dan persetujuan pengembalian
            dana dapat dipantau melalui{' '}
            <Link
              href='/akun/pengaduan'
              className='font-medium text-primary underline underline-offset-4'
            >
              Pengaduan Saya
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        id='aktivitas-terlarang'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>AKTIVITAS YANG DILARANG</h2>
        <p>
          Konten dan infrastruktur yang digunakan untuk menyediakan Layanan merupakan milik
          PanganTani atau pemberi lisensi kami. Selain untuk Konten milik Anda sendiri, Anda setuju
          untuk tidak memodifikasi, menyalin, mendistribusikan, menjual, atau mengeksploitasi bagian
          mana pun dari Layanan. Secara khusus, Anda dilarang melakukan tindakan berikut:
        </p>
        <ul className='list-disc space-y-2 pl-6'>
          {PROHIBITED_ACTIVITIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        id='kebijakan-privasi'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          KEBIJAKAN PRIVASI DAN PENGUNGKAPAN DATA
        </h2>
        <p>
          Setiap data pribadi yang Anda kirimkan sehubungan dengan penggunaan Layanan—termasuk nama,
          kontak, alamat pengambilan, bukti transfer, serta rekening tujuan pengembalian
          dana—dikelola sesuai dengan{' '}
          <Link href='/privasi' className='font-medium text-primary underline underline-offset-4'>
            Kebijakan Privasi
          </Link>{' '}
          PanganTani. Katalog hanya menampilkan wilayah umum petani, sedangkan alamat lengkap lokasi
          pengambilan dibuka kepada pembeli setelah reservasi tercatat.
        </p>
      </section>

      <section
        id='konten-dan-lisensi'
        className='flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6'
      >
        <h2 className='text-xl font-bold text-foreground'>
          KONTEN PENGGUNA, PAPAN KEBUTUHAN, DAN PEMBERIAN LISENSI
        </h2>
        <p>
          Dengan mengunggah Konten ke Layanan—seperti deskripsi penawaran panen, permintaan pada
          Papan Kebutuhan Pangan, foto bukti pembayaran, foto kondisi panen pada pengaduan, atau
          saran—Anda memberikan kepada PanganTani lisensi non-eksklusif, bebas royalti, dan dapat
          dialihkan untuk menampilkan, memproses, menyimpan, dan menggunakan Konten tersebut guna
          menjalankan, memverifikasi, serta meningkatkan kualitas Layanan.
        </p>
        <div id='batasan-konten-pengguna' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>Batasan Konten yang Diunggah</h3>
          <p>Anda secara tegas menyetujui untuk tidak mengunggah atau mengirimkan Konten yang:</p>
          <ol className='list-outside list-lower-alpha space-y-2 pl-6'>
            {PROHIBITED_CONTENT_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>
        <div id='moderasi-dan-penangguhan' className='flex scroll-mt-24 flex-col gap-2.5'>
          <h3 className='text-base font-semibold text-foreground'>
            Pembatasan dan Penangguhan Akses Layanan
          </h3>
          <p>
            PanganTani berhak meninjau, membatasi, atau menghapus Konten serta menangguhkan atau
            menghentikan akses akun Pengguna apabila terdapat indikasi pelanggaran terhadap
            Perjanjian ini, penyalahgunaan alur pengaduan, atau ancaman terhadap keamanan komunitas
            dan Layanan.
          </p>
        </div>
      </section>
    </>
  )
}
