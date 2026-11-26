export interface FaqItem {
  question: string
  answer: string
}

export const buyerFaqItems: ReadonlyArray<FaqItem> = [
  {
    question: 'Bagaimana cara memesan panen?',
    answer:
      'Pilih penawaran, masukkan berat yang ingin dibeli, pilih slot pengambilan, lalu buat reservasi.',
  },
  {
    question: 'Bagaimana pembayaran dilakukan?',
    answer:
      'Transfer sesuai nominal ke rekening pada instruksi pembayaran, lalu unggah bukti transfer dalam 30 menit setelah reservasi dibuat. Admin memeriksa bukti pembayaran.',
  },
  {
    question: 'Kapan alamat lengkap terlihat?',
    answer:
      'Alamat lengkap dan patokan pengambilan tampil setelah reservasi dibuat. Jadwalnya mengikuti slot yang Anda pilih.',
  },
  {
    question: 'Apakah pesanan diantar?',
    answer:
      'Tidak. Pesanan diambil mandiri di lokasi petani sesuai jadwal pada penawaran, tanpa biaya kirim.',
  },
  {
    question: 'Bagaimana berat aktual dicatat?',
    answer:
      'Timbang hasil panen bersama petani saat pengambilan, lalu masukkan berat aktual di detail pesanan.',
  },
]
