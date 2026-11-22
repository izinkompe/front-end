# Panduan Desain PanganTani

Gunakan panduan ini setiap kali membuat atau mengubah UI. Terapkan skill dalam urutan berikut.

1. Baca [frontend-design](.agents/skills/frontend-design/SKILL.md) untuk menentukan hierarki, susunan konten, dan alur interaksi pada layar kecil.
2. Baca [shadcn](.agents/skills/shadcn/SKILL.md) untuk memilih dan merangkai komponen. Gunakan komponen yang sudah tersedia di `src/components/ui/` dan ikuti style `base-lyra` dengan Base UI dari [components.json](components.json).
3. Baca [tailwind-design-system](.agents/skills/tailwind-design-system/SKILL.md) dan [tailwind-4-docs](.agents/skills/tailwind-4-docs/SKILL.md) untuk menerapkan font, border, warna, spacing, radius, dan tata letak. Jika snapshot Tailwind belum tersedia, rujuk [dokumentasi resmi Tailwind CSS](https://tailwindcss.com/docs).

## Style bawaan shadcn

- Gunakan tampilan bawaan `base-lyra` dari preset `b6G3c108Q` dengan tema Emerald dan palet grafik kuning. Pertahankan warna, ukuran teks, border, radius, dan state komponen.
- Gunakan `className` pada komponen shadcn untuk penempatan dan ukuran dalam layout. Untuk elemen halaman, gunakan utilitas Tailwind dan token yang sudah ada di [globals.css](src/app/globals.css), seperti `font-sans`, `font-heading`, `text-foreground`, `bg-background`, dan `border-border`. [Theming shadcn](https://ui.shadcn.com/docs/theming)

## Ukuran bawaan (default size) untuk semua komponen dan layout

- Gunakan `size="default"` (atau biarkan default tanpa mendefinisikan prop `size`) untuk seluruh komponen di seluruh layout, halaman dashboard, header, dan kartu (seperti `Button`, `Badge`, `Avatar`, `Input`, `Select`, `Table`).
- Jangan mengecilkan komponen menggunakan `size="sm"` atau `size="xs"`, serta hindari memperbesar dengan `size="lg"`. Seluruh layout wajib mengikuti skala default agar hierarki, keterbacaan, dan area interaksi (click/tap targets) konsisten dan ergonomis.
- Hindari menambahkan utilitas tinggi atau ukuran manual yang menimpa prop komponen (misalnya `h-7`, `h-8`, atau `h-9` pada tombol).
- Khusus untuk tombol aksi yang hanya memuat ikon tunggal tanpa label teks (misalnya tombol aksi tabel, pemicu panel navigasi, atau tombol penutup modal), gunakan `size="icon"`.

## Tipografi tanpa letter-spacing tambahan

Gunakan Lato untuk `font-sans` dan `font-heading`, serta Lora untuk `font-serif`. Gunakan jarak huruf bawaan font. Jangan menambahkan `letter-spacing`, `letterSpacing`, atau utilitas `tracking-*` pada judul, heading, label, tombol, maupun teks lainnya. Atur hierarki dengan ukuran font, ketebalan, dan tinggi baris dari skala Tailwind. [Referensi letter-spacing Tailwind](https://tailwindcss.com/docs/letter-spacing)

## Mobile-first

Mulai dari layout layar kecil dengan kelas tanpa prefiks. Tambahkan `sm:`, `md:`, atau `lg:` sesuai kebutuhan saat ruang bertambah. Contohnya, `grid grid-cols-1 gap-4 md:grid-cols-2` menampilkan satu kolom di ponsel dan dua kolom mulai breakpoint `md`. Periksa UI di layar kecil dan lebar untuk memastikan konten muat dan semua kontrol bisa digunakan. [Responsive design Tailwind](https://tailwindcss.com/docs/responsive-design)
