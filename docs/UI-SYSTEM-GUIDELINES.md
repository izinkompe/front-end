# Panduan Sistem UI: Tipografi, Komponen, Responsif, Ikon, & Layout

Dokumen ini merangkum standar desain teknis PanganTani yang diimplementasikan di [src/app/globals.css](../src/app/globals.css) dan seluruh `src/components/`. Untuk aturan khusus penambahan primitif `shadcn/ui`, rujuk [panduan komponen shadcn](SHADCN-COMPONENT-GUIDELINES.md).

## 1. Tipografi & Readability

### A. Sumber Font & Aturan Tanpa `tracking-*`

- `src/app/layout.tsx` memuat `IBM_Plex_Sans` (`--font-sans`, `--font-heading`) dan `Geist_Mono` (`--font-mono`).
- Jangan menambahkan `letter-spacing` maupun kelas `tracking-*` (`tracking-tight`, `tracking-wide`, `tracking-widest`) di komponen atau CSS.
- Jangan mengunci `font-size` pada `html` atau `:root` default agar `<meta name="text-scale" content="scale" />` dan `:root[data-text-scale='large' | 'xlarge']` berfungsi penuh.

### B. Skala Ukuran Font Responsif (`@theme inline` & `@utility`)

Seluruh ukuran memakai `clamp()` berbasis `rem` + `vw` dengan rasio maksimum `max/min <= 1.75` (memenuhi batas `<= 2.5x` WCAG 1.4.4 Resize Text) dan `line-height` tanpa satuan:

| Kelas / Token                       | Rentang Ukuran (`320px` -> `1536px+`)            | Line Height | Kegunaan                                     |
| ----------------------------------- | ------------------------------------------------ | ----------- | -------------------------------------------- |
| `type-display` / `text-display`     | `1.75rem` (`28px`) -> `3rem` (`48px`)            | `1.15`      | Hero utama & banner besar                    |
| `type-kpi` / `text-kpi`             | `1.75rem`–`2rem` -> `3rem`–`3.5rem`              | `1.1`       | Angka metrik & statistik dampak              |
| `type-h1` / `h1`                    | `1.5rem` (`24px`) -> `2.25rem` (`36px`)          | `1.2`       | Judul halaman utama (`<h1>`)                 |
| `type-h2` / `h2`                    | `1.3125rem` (`21px`) -> `1.875rem` (`30px`)      | `1.25`      | Judul seksi halaman (`<h2>`)                 |
| `type-h3` / `h3`                    | `1.125rem` (`18px`) -> `1.375rem` (`22px`)       | `1.3`       | Subjudul seksi, judul dialog/sheet           |
| `type-h4` / `h4`                    | `1rem` (`16px`) -> `1.125rem` (`18px`)           | `1.35`      | Sub-grup konten & empty/alert title          |
| `type-lead` / `text-lead`           | `1.0625rem` (`17px`) -> `1.25rem` (`20px`)       | `1.55`      | Subjudul hero & paragraf pembuka             |
| `text-base` / `type-body` / `body`  | `1rem` (`16px`) -> `1.0625rem` (`17px`)          | `1.6`       | Teks isi default, form, & tombol             |
| `text-meta` / `type-meta` / `small` | `0.875rem` (`14px`) -> `0.9375rem` (`15px`)      | `1.5`       | Metadata sekunder & catatan kaki             |
| `type-card-title`                   | `1.0625rem`–`1.125rem` -> `1.3125rem`–`1.375rem` | `1.375`     | Judul kartu adaptif via `@container` (`cqi`) |
| `type-prose`                        | Sama dengan `text-base` + `max-w-[65ch]`         | `1.6`       | Paragraf bacaan panjang / artikel            |

### C. Aturan Readability

- **Panjang baris (measure):** batasi paragraf panjang maksimal `65ch` (`type-prose` atau `max-w-[65ch]`). Elemen `article :where(p, li, blockquote)` sudah dibatasi otomatis di `@layer base`.
- **Wrapping teks:** judul (`h1`–`h6`, `th`) memakai `text-balance`; teks isi (`p`, `li`, `blockquote`) memakai `text-pretty`; tautan dan kode memakai `overflow-wrap: anywhere`.
- **Hindari teks di bawah `14px`:** gunakan minimal `text-sm` / `text-meta` (`14px`) untuk seluruh metadata yang dibaca pengguna. Ukuran `text-xs` (`12px`) hanya diperbolehkan untuk lencana numerik padat seperti badge hitungan notifikasi.

## 2. Ikon (`icon-xs`–`icon-xl`)

### A. Skala Token Ikon

Seluruh ikon memakai token dari `:root` dan utilitas `@utility icon-*` di `src/app/globals.css` yang otomatis menerapkan `shrink-0` dan `pointer-events-none`:

| Utilitas  | Token CSS   | Rentang (`320px` -> `1536px+`) | Penggunaan                                                             |
| --------- | ----------- | ------------------------------ | ---------------------------------------------------------------------- |
| `icon-xs` | `--icon-xs` | `14px` -> `15px`               | Ikon di dalam `Badge`, separator breadcrumb, indikator padat           |
| `icon-sm` | `--icon-sm` | `16px` -> `17px`               | Ikon inline sejajar `text-sm`/`text-meta`, metadata kartu, tombol `sm` |
| `icon-md` | `--icon-md` | `18px` -> `20px`               | Ikon standar pada `Button`, `InputGroup`, `Select`, `Tabs`, `Alert`    |
| `icon-lg` | `--icon-lg` | `20px` -> `24px`               | Ikon pada tombol `lg`/`icon-lg`, header seksi, fitur kartu             |
| `icon-xl` | `--icon-xl` | `28px` -> `36px`               | Ikon etalase, empty state, dan ilustrasi ringkas                       |

### B. Aksesibilitas Ikon

- Ikon dekoratif di samping label teks wajib diberi `aria-hidden='true'`.
- Tombol ikon tanpa teks terlihat wajib memiliki `aria-label` (atau teks `.sr-only`) dan target sentuh minimal `44px × 44px` (`size='icon'` atau `touch-target`).

## 3. Arsitektur Komponen & Reusabilitas

### A. Pembagian Lapisan Komponen

1. **Primitif UI (`src/components/ui/`):** pembungkus tipis `@base-ui/react` dengan varian CVA dan token `globals.css`. Lihat [panduan komponen shadcn](SHADCN-COMPONENT-GUIDELINES.md).
2. **Komponen Shared Multi-Halaman (`src/components/shared/`, `src/components/layout/`, dll.):** komponen yang dipakai di lebih dari satu rute (seperti `CommoditySearchInput`, `HeroSearchCombobox`, `LocationPicker`, `GlobalHeader`, `GlobalFooter`, `BrandLogo`). Jangan menduplikasi markup komponen serupa di halaman berbeda.
3. **Komponen Domain/Rute (`src/components/home/`, `catalog/`, `dashboard/`, dll.):** komposisi spesifik fitur yang memanfaatkan primitif UI dan kelas reusable `globals.css`.

### B. Utilitas Reusable di `src/app/globals.css`

Gunakan utilitas global berikut untuk menjaga konsistensi antarhalaman:

- `page-shell`: kontainer halaman `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.
- `section-spacing`: jarak vertikal antar seksi `py-10 sm:py-12 lg:py-16`.
- `skip-link`: tautan aksesibilitas `#konten-utama` di awal layout.
- `touch-target`: penegak ukuran minimum `min-h-10 min-w-10 pointer-coarse:min-h-11 pointer-coarse:min-w-11`.
- `pill-control` & `chip-toggle`: kontrol filter pill dan chip toggle berstatus `aria-pressed`.
- `sticky-bar-safe`: padding bawah aman `env(safe-area-inset-bottom)` untuk bar aksi lengket.
- `table-scroll-region`: pembungkus tabel horizontal dengan fokus keyboard dan `@container`.
- `scroll-strip`: deretan tab/chip horizontal tanpa scrollbar visual yang mendukung `scroll-padding-inline`.

## 4. Responsivitas (`320px`–`1536px+`) & Container Queries

- **Mobile-first:** susun tata letak dasar untuk lebar `320px` tanpa horizontal overflow halaman, lalu perluas secara bertahap melalui `sm:` (`640px`), `md:` (`768px`), `lg:` (`1024px`), `xl:` (`1280px`), dan `2xl:` (`1536px`).
- **Viewport dinamis (`dvh`/`dvw`):** gunakan `min-h-dvh` untuk shell halaman penuh dan `max-h-[90dvh]` / `max-h-[min(22rem,55dvh)]` untuk dialog, sheet, dan dropdown agar tidak terpotong oleh bilah alamat atau keyboard virtual ponsel.
- **Container queries (`@container`):** gunakan `@container/card` pada pembungkus kartu atau panel agar judul (`type-card-title`) dan tata letak internal menyesuaikan lebar kolom tempatnya berada.
- **Popover & Dropdown:** batasi lebar overlay agar aman di layar `320px` dengan `w-(--available-width)` atau `max-w-[calc(100vw-2rem)]`.

## 5. Layout (Grid & Flex)

### A. Kapan Memakai Flex vs Grid

- **Flexbox (`flex`):** gunakan untuk susunan 1 dimensi (baris tombol, header toolbar, metadata ikon + teks, footer bar).
  - Tambahkan `flex-wrap` pada grup chip/toolbar agar tidak meluap ke samping.
  - Tambahkan `min-w-0` pada anak flex (`flex-1 min-w-0`) yang memuat teks `truncate` atau `wrap-anywhere`.
- **CSS Grid (`grid`):** gunakan untuk tata letak 2 dimensi atau kolom yang harus sejajar (katalog kartu, formulir 2 kolom, layout split peta + daftar).
  - Gunakan track fleksibel `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` atau `lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]`.
  - Selalu pakai `minmax(0, ...)` pada kolom grid kustom agar konten panjang tidak memaksa kolom melebar melewati layar.

```tsx
<section className='section-spacing'>
  <div className='page-shell grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
    <article className='@container/card flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-5'>
      <h2 className='type-card-title text-foreground'>Judul Komoditas</h2>
      <p className='type-prose text-muted-foreground'>Ringkasan singkat hasil panen.</p>
    </article>
  </div>
</section>
```

### B. Stabilitas Media & Sticky Layout

- Bungkus gambar kartu dengan kontainer berasio tetap (`aspect-4/3`, `aspect-square`, `aspect-video`) dan `relative overflow-hidden` agar tidak terjadi pergeseran tata letak (CLS).
- Set `scroll-padding-top` (`6.5rem`) dan `scroll-padding-bottom` (`calc(4.5rem + env(safe-area-inset-bottom, 0px))`) pada `html` agar elemen terfokus tidak tertutup header maupun bar bawah lengket (WCAG 2.4.11).

## 6. Aksesibilitas & Pengujian Wajib

- **Landmark & Skip Link:** setiap layout halaman wajib memiliki satu `<main id='konten-utama' tabIndex={-1}>` dan tautan `<a href='#konten-utama' className='skip-link'>` di awal dokumen.
- **Tabel Data:** bungkus `<table>` dengan `<div tabIndex={0} role='region' aria-labelledby='...' className='table-scroll-region'>` dan sediakan `<caption>` serta `<th scope='col' | 'row'>`.
- **Validasi sebelum selesai:** jalankan `bun run format:check`, `bun run lint`, `bun run next typegen && bun run tsc --noEmit`, `bun run test`, `bun run build`, dan `bash scripts/smoke.sh`, serta periksa navigasi keyboard (`Tab`, `Enter`, `Space`, `Esc`), zoom `200%`/`400%`, mode gelap, dan `.high-contrast`.
