# Panduan Desain PanganTani

Gunakan panduan ini setiap kali membuat atau mengubah UI. Terapkan skill dalam urutan berikut.

1. Cari pola web yang relevan dengan [modern-web-guidance](.agents/skills/modern-web-guidance/SKILL.md) sebelum memilih implementasi.
2. Baca [frontend-design](.agents/skills/frontend-design/SKILL.md) untuk menentukan hierarki, susunan konten, dan alur interaksi pada layar kecil.
3. Baca [shadcn](.agents/skills/shadcn/SKILL.md) untuk memilih dan merangkai komponen. Gunakan komponen yang sudah tersedia di `src/components/ui/` dan ikuti style `base-lyra` dengan Base UI dari [components.json](components.json).
4. Baca [tailwind-design-system](.agents/skills/tailwind-design-system/SKILL.md) dan [tailwind-4-docs](.agents/skills/tailwind-4-docs/SKILL.md) untuk menerapkan font, border, warna, spacing, radius, dan tata letak. Jika snapshot Tailwind belum tersedia, rujuk [dokumentasi resmi Tailwind CSS](https://tailwindcss.com/docs).

## Style bawaan shadcn

- Gunakan tampilan bawaan `base-lyra` dari preset `b6G3c108Q` dengan tema Emerald dan palet grafik kuning. Pilih `variant` dan `size` bawaan sesuai kebutuhan. Pertahankan warna, ukuran teks, border, radius, dan state komponen.
- Gunakan `className` pada komponen shadcn untuk penempatan dan ukuran dalam layout. Untuk elemen halaman, gunakan utilitas Tailwind dan token yang sudah ada di [globals.css](src/app/globals.css), seperti `font-sans`, `font-heading`, `text-foreground`, `bg-background`, dan `border-border`. [Theming shadcn](https://ui.shadcn.com/docs/theming)

## Tipografi tanpa letter-spacing tambahan

Gunakan Lato untuk `font-sans` dan `font-heading`, serta Lora untuk `font-serif`. Gunakan jarak huruf bawaan font. Jangan menambahkan `letter-spacing`, `letterSpacing`, atau utilitas `tracking-*` pada judul, heading, label, tombol, maupun teks lainnya. Atur hierarki dengan ukuran font, ketebalan, dan tinggi baris dari skala Tailwind. [Referensi letter-spacing Tailwind](https://tailwindcss.com/docs/letter-spacing)

## Mobile-first

Mulai dari layout layar kecil dengan kelas tanpa prefiks. Tambahkan `sm:`, `md:`, atau `lg:` sesuai kebutuhan saat ruang bertambah. Contohnya, `grid grid-cols-1 gap-4 md:grid-cols-2` menampilkan satu kolom di ponsel dan dua kolom mulai breakpoint `md`. Periksa UI di layar kecil dan lebar untuk memastikan konten muat dan semua kontrol bisa digunakan. [Responsive design Tailwind](https://tailwindcss.com/docs/responsive-design)

## Notifikasi

- Gunakan `/akun/notifikasi` untuk riwayat dan filter kategori. Gunakan popover lonceng untuk cuplikan. Tampilkan label kategori dan status **Belum dibaca** sebagai teks agar keduanya terbaca tanpa mengandalkan warna.
- Letakkan pesan yang perlu tindakan di dekat langkah terkait. Gunakan banner untuk kondisi yang masih berlaku dan dialog jika pengguna perlu merespons sebelum melanjutkan. Pakai toast hanya untuk konfirmasi tambahan yang tersedia juga di UI.
- Pertahankan fokus ketika pesan masuk. Gunakan pengumuman sopan untuk pembaruan rutin yang perlu disampaikan dan pengumuman asertif untuk kondisi mendesak. Pastikan kontrol popover dan daftar dapat digunakan dengan keyboard.

Lihat pemetaan kategori, aturan tampil, dan skenario pengujian dalam [panduan notifikasi](docs/NOTIFICATIONS.md).
