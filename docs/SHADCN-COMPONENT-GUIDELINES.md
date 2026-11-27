# Panduan Menambahkan dan Menyesuaikan Komponen shadcn/ui Baru

Dokumen ini menjadi acuan wajib setiap kali menambahkan komponen baru dari `shadcn` (preset `base-nova` dengan `@base-ui/react` di `components.json`) atau membuat primitif baru di `src/components/ui/`.

## 1. Konvensi Dasar Repositori

- **React 19 tanpa `forwardRef`:** terima `ref` langsung sebagai prop biasa bila diperlukan dan gunakan `React.ComponentProps<'...'>` atau tipe prop native Base UI (`DialogPrimitive.Title.Props`, `useRender.ComponentProps<'span'>`).
- **Nama berkas dan komponen:** gunakan huruf kecil dengan tanda hubung untuk nama berkas (misalnya `alert-dialog.tsx`) dan `PascalCase` untuk nama komponen yang diekspor.
- **Tanpa komentar kode:** ikuti [panduan gaya kode](CODE-STYLE.md) — jangan meninggalkan komentar sebaris, blok komentar, JSDoc, atau TODO di dalam berkas sumber maupun berkas uji.
- **Batas panjang berkas:** maksimal 500 baris per berkas; pecah sub-komponen ke berkas terpisah bila mendekati batas.
- **Format dan utilitas kelas:** gunakan `cn` dan pertahankan atribut `data-slot` bawaan shadcn agar selector `has-data-[slot=...]` dan `group-data-[...]` tetap bekerja konsisten.

## 2. Penyesuaian Wajib dari Default `shadcn` (`base-nova`)

Default `shadcn` sering memakai ukuran kompak untuk desktop yang belum memenuhi keterbacaan teks maupun ukuran target sentuh WCAG 2.2 AA. Sebelum komponen dipakai di halaman, lakukan penyesuaian berikut:

### A. Ukuran Target Sentuh & Tinggi Fleksibel

- **Ganti `h-*` / `size-*` tetap dengan `min-h-*` / `min-w-*`:** jangan mengunci tinggi elemen yang berisi teks (`Button`, `Input`, `SelectTrigger`, `TabsTrigger`, `Badge`, `Toggle`) dengan `h-7` atau `h-8`. Gunakan tinggi minimum agar teks tetap tumbuh saat _text-spacing_ (WCAG 1.4.12) atau _zoom_ 200%–400% aktif.
- **Standar ukuran target minimum:**
  - Kontrol utama (`Button` default, `Input`, `SelectTrigger`, `TabsTrigger`): `min-h-11` (`44px`) dan `pointer-coarse:min-h-12` (`48px`).
  - Kontrol sekunder/kompak (`sm`, chip filter, tautan aksi): `min-h-10` (`40px`) dan `pointer-coarse:min-h-11` (`44px`).
  - Tombol ikon (`icon`, tombol tutup dialog/sheet): `min-h-11 min-w-11` (`44px × 44px`), atau perluas area klik dengan pseudo-element (`after:-inset-2`) bila visual ikon harus tetap ringkas.
  - Checkbox & Radio: pastikan area klik `<label>` atau pembungkusnya minimal `44px × 44px` pada perangkat sentuh.

### B. Tipografi & Kontras

- **Gunakan skala dari `src/app/globals.css`:**
  - Judul kartu (`CardTitle`): `type-card-title`.
  - Judul dialog/sheet (`DialogTitle`, `SheetTitle`): `type-h3`.
  - Judul alert/empty (`AlertDialogTitle`, `EmptyTitle`): `type-h4`.
  - Deskripsi & helper text: `text-meta text-muted-foreground`.
  - Input, select, textarea, label, dan tombol utama: minimal `text-base` (`16px`) untuk mencegah _auto-zoom_ pada iOS Safari dan menjaga keterbacaan.
  - Badge: minimal `text-sm leading-snug`.
- **Dilarang memakai `tracking-*`:** ikuti [DESIGN.md](../DESIGN.md) — hapus `tracking-tight`, `tracking-wide`, atau `tracking-widest` bawaan template shadcn.
- **Kontras & High Contrast Mode:** gunakan token semantik (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-ring`) agar otomatis mendukung mode terang, gelap, `.high-contrast`, dan _Forced Colors Mode_ (`border` nyata + `focus-visible:outline-2`).

### C. Standar Ukuran Ikon (`icon-xs`–`icon-xl`)

- **Gunakan skala token ikon dari `src/app/globals.css`:** hindari ukuran ad-hoc seperti `size-3.5` atau `size-4.5` yang terlepas dari skala. Gunakan utilitas `icon-xs`, `icon-sm`, `icon-md`, `icon-lg`, atau `icon-xl` (atau `size-(--icon-*)` pada selector `[&_svg:not([class*='size-']):not([class*='icon-'])]`).
  - `icon-xs` (`14px`–`15px`): ikon di dalam `Badge`, separator breadcrumb, atau indikator mikro.
  - `icon-sm` (`16px`–`17px`): ikon inline sejajar teks `text-sm`/`text-meta`, metadata kartu, dan tombol ukuran `sm`.
  - `icon-md` (`18px`–`20px`): ikon default pada `Button`, `InputGroup`, `Select`, `Tabs`, dan `Alert`.
  - `icon-lg` (`20px`–`24px`): ikon pada tombol `lg`/`icon-lg`, header seksi, dan kartu fitur.
  - `icon-xl` (`28px`–`36px`): ikon etalase, empty state, atau ilustrasi ringkas.
- **Perilaku flex & aksesibilitas:** seluruh utilitas `icon-*` menerapkan `shrink-0` dan `pointer-events-none` agar ikon tidak mengecil di dalam flex container dan tidak menghalangi klik. Ikon dekoratif wajib memakai `aria-hidden='true'`, dan tombol ikon tanpa teks wajib memiliki `aria-label`.

### C. Responsivitas & Overflow

- **Mobile-first (`320px`–`1536px+`):** jangan memakai lebar tetap seperti `w-72` atau `w-80` tanpa batas maksimum (`max-w-[calc(100vw-2rem)]` atau `w-(--available-width)` untuk popover/dropdown).
- **Container Queries (`@container`):** tambahkan `@container/<nama>` pada komponen pembungkus seperti kartu atau grup form agar tata letak internal beradaptasi terhadap lebar kontainer, bukan hanya lebar layar.
- **Viewport dinamis pada overlay:** gunakan `max-h-[90dvh]` (bukan `vh`) untuk dialog, drawer, atau popover tinggi, dan pastikan `overscroll-behavior: contain` aktif pada modal.
- **Mencegah pemotongan teks:** tambahkan `min-w-0` pada flex/grid item yang memuat teks panjang dan hindari `whitespace-nowrap` pada kalimat atau label multi-kata.

### D. Aksesibilitas (Keyboard, Fokus, & Screen Reader)

- **HTML semantik & Base UI:** pertahankan komponen primitif Base UI (`Dialog`, `Popover`, `Select`, `Tabs`, `Accordion`) agar _focus trap_, `Esc` untuk menutup, dan navigasi panah berfungsi otomatis.
- **Tombol ikon wajib bernama:** setiap tombol tanpa teks terlihat wajib memiliki `aria-label` (atau teks `.sr-only`), dan ikon dekoratif di dalamnya wajib memiliki `aria-hidden='true'`.
- **State interaktif:** gunakan `aria-pressed` untuk toggle, `aria-expanded` untuk pemicu popover/accordion, serta `aria-invalid` dan `aria-describedby` untuk pesan galat form.
- **Fokus terlihat:** pertahankan gaya `:focus-visible` dengan `outline` / `ring` yang kontras dan jangan pernah menghapus `outline` tanpa pengganti.

## 3. Gaya Reusable di `src/app/globals.css`

Jika komponen baru membutuhkan pola gaya berulang lintas halaman (misalnya chip filter, bar aksi lengket, atau pembungkus tabel scroll), definisikan utilitas di `src/app/globals.css` menggunakan `@utility` atau `@layer base` alih-alih menduplikasi string kelas panjang di banyak berkas.

## 4. Checklist Sebelum Selesai

1. Pastikan tidak ada komentar kode maupun utilitas `tracking-*` yang tersisa.
2. Tambahkan atau perbarui unit test di samping berkas komponen (mengikuti pola `src/components/ui/button.test.mjs`) untuk memverifikasi varian dan ukuran target.
3. Jalankan seluruh pemeriksaan:
   - `bun run format:check`
   - `bun run lint`
   - `bun run next typegen && bun run tsc --noEmit`
   - `bun run test`
   - `bun run build`
4. Catat berkas yang ditambahkan/diubah beserta hasil verifikasi ke `logs/checkpoints/`.
