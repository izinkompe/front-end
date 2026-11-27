# Panduan Desain PanganTani

Gunakan panduan ini setiap kali membuat atau mengubah UI. Terapkan skill dalam urutan berikut:

1. Cari pola web yang relevan dengan [modern-web-guidance](.agents/skills/modern-web-guidance/SKILL.md) sebelum memilih implementasi.
2. Baca [frontend-design](.agents/skills/frontend-design/SKILL.md) dan [visual-design-foundations](.agents/skills/visual-design-foundations/SKILL.md) untuk menentukan hierarki, susunan konten, dan alur interaksi pada layar kecil.
3. Baca [accessibility-compliance](.agents/skills/accessibility-compliance/SKILL.md) untuk memastikan kepatuhan WCAG 2.2 AA (target sentuh, navigasi keyboard, kontras, dan pembaca layar).
4. Baca [shadcn](.agents/skills/shadcn/SKILL.md) dan [panduan komponen shadcn](docs/SHADCN-COMPONENT-GUIDELINES.md) saat menambah atau menyesuaikan primitif di `src/components/ui/` dengan preset `base-nova` dan `@base-ui/react` dari [components.json](components.json).
5. Baca [tailwind-design-system](.agents/skills/tailwind-design-system/SKILL.md), [tailwind-4-docs](.agents/skills/tailwind-4-docs/SKILL.md), dan [panduan sistem UI](docs/UI-SYSTEM-GUIDELINES.md) untuk menerapkan tipografi, ikon, grid/flex layout, pola responsif, dan utilitas reusable dari [globals.css](src/app/globals.css).

## Style Bawaan & Token Tema

- Gunakan gaya `base-nova` dengan palet warna semantik berbasis `oklch` pada [globals.css](src/app/globals.css) (`primary` Emerald, `background`, `foreground`, `card`, `muted`, `border`, `ring`), lengkap dengan varian `.dark` dan `.high-contrast`.
- Gunakan utilitas reusable yang sudah tersedia di [globals.css](src/app/globals.css) (`page-shell`, `section-spacing`, `skip-link`, `touch-target`, `pill-control`, `chip-toggle`, `sticky-bar-safe`, `table-scroll-region`, `scroll-strip`) sebelum menulis kombinasi kelas panjang yang berulang.

## Tipografi Tanpa Letter-Spacing Tambahan

- Proyek ini memuat `IBM_Plex_Sans` untuk `font-sans` dan `font-heading`, serta `Geist_Mono` untuk `font-mono` di [layout.tsx](src/app/layout.tsx).
- Gunakan jarak huruf bawaan font. Jangan menambahkan `letter-spacing`, `letterSpacing`, atau utilitas `tracking-*` pada judul, heading, label, tombol, maupun teks lainnya.
- Atur hierarki dengan token responsif dari [globals.css](src/app/globals.css) (`type-display`, `type-kpi`, `type-h1`–`type-h4`, `type-lead`, `text-base` / `type-body`, `text-meta`, `type-prose`, `type-card-title`) serta pertahankan skala OS (`<meta name="text-scale" content="scale" />` dan `:root[data-text-scale]`).

## Ikon & Target Sentuh

- Gunakan skala ikon seragam dari [globals.css](src/app/globals.css) (`icon-xs`, `icon-sm`, `icon-md`, `icon-lg`, `icon-xl`) agar ukuran ikon konsisten di seluruh layar.
- Pastikan kontrol interaktif memiliki target minimum `40px` (`min-h-10`) dan `44px` (`pointer-coarse:min-h-11` / `touch-target`) pada perangkat sentuh.

## Mobile-First, Grid & Flex Layout

- Mulai dari layout layar kecil (`320px`) tanpa prefiks, lalu tambahkan `sm:`, `md:`, `lg:`, `xl:`, atau `@container` sesuai kebutuhan ruang.
- Gunakan `flex` untuk tata letak 1 dimensi dan `grid` dengan track fleksibel (`minmax(0, ...)`) untuk struktur 2 dimensi. Selalu tambahkan `min-w-0` pada item flex/grid yang memuat teks panjang dan `min-h-dvh` untuk shell halaman penuh.
- Lihat detail lengkap aturan tipografi, ikon, komponen, responsivitas, dan layout pada [panduan sistem UI](docs/UI-SYSTEM-GUIDELINES.md) serta [panduan komponen shadcn](docs/SHADCN-COMPONENT-GUIDELINES.md).

## Notifikasi

- Gunakan `/akun/notifikasi` untuk riwayat dan filter kategori. Gunakan popover lonceng untuk cuplikan. Tampilkan label kategori dan status **Belum dibaca** sebagai teks agar keduanya terbaca tanpa mengandalkan warna.
- Letakkan pesan yang perlu tindakan di dekat langkah terkait. Gunakan banner untuk kondisi yang masih berlaku dan dialog jika pengguna perlu merespons sebelum melanjutkan. Pakai toast hanya untuk konfirmasi tambahan yang tersedia juga di UI.
- Pertahankan fokus ketika pesan masuk. Gunakan pengumuman sopan (`aria-live='polite'`) untuk pembaruan rutin yang perlu disampaikan dan pengumuman asertif (`role='alert'`) untuk kondisi mendesak. Pastikan kontrol popover dan daftar dapat digunakan dengan keyboard.

Lihat pemetaan kategori, aturan tampil, dan skenario pengujian dalam [panduan notifikasi](docs/NOTIFICATIONS.md).
