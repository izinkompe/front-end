# Pull Request: `dev-pembeli` -> `dev`

## Identifier & Metadata

- **Judul PR:** `feat(pembeli): lengkapi alur halaman pembeli, pasar, checkout, akun, dan autentikasi petani`
- **Branch Sumber:** `dev-pembeli`
- **Branch Target:** `dev`
- **Ringkasan Statistik Perubahan (`git diff --shortstat dev..HEAD`):** 321 file berubah (`+42.918` / `-979` baris)

---

## Ringkasan Perubahan

Pull Request ini menggabungkan seluruh implementasi fitur sisi **Pembeli**, eksplorasi **Pasar & Peta Radius**, **Checkout & Manajemen Pesanan**, **Profil Toko Petani**, **Pusat Akun & Notifikasi**, **Autentikasi Pembeli & Onboarding Petani**, **Pusat Informasi & SEO**, serta **Pengujian Integrasi & Unit** dari branch `dev-pembeli` ke `dev`.

---

## Rincian Pembahasan

### 1. Beranda Pembeli (`(global)/page.tsx`)

- **Hero Section & Pencarian Komoditas:** Implementasi hero section dengan latar belakang baru (`public/images/hero.webp`), kartu pencarian mengambang dengan pill mode, ikon kategori pada dropdown, serta autocomplete combobox (`src/components/shared/commodity-search-input.tsx`).
- **Section Kurasi Beranda:**
  - _Penawaran Segera Ditutup_ dengan perhitungan countdown dan jarak garis lurus.
  - _Etalase Panen per Kategori_ (4 kategori utama) beserta kartu produk.
  - _Sentra Panen Terdekat_, _Papan Kebutuhan Pangan_, _Pangan Tersalurkan_, dan _FAQ Accordion_ (`src/lib/data/faq.ts`).
- **Optimasi Visual & Mobile:** Peningkatan kontras warna, hirarki tipografi, ukuran target klik, serta tata letak hero dan tab informasi di perangkat mobile.

### 2. Katalog Pasar, Peta Radius & Detail Penawaran (`(pasar)`)

- **Halaman Katalog (`/pasar` dan `/pasar/[category]`):**
  - Layout layar penuh dengan tampilan split view katalog dan peta interaktif berbasis Leaflet (`src/components/catalog/catalog-radius-map.tsx`, `use-catalog-leaflet-map.ts`).
  - Fitur cluster popover, kontrol reset peta, sticky map di desktop, serta modal peta layar penuh untuk perangkat mobile.
  - Filter kategori, pencarian, dan sorting (`src/lib/data/catalog-filters.ts`, `catalog-map-helpers.ts`).
- **Halaman Detail Komoditas (`/pasar/penawaran/[id]`):**
  - Komponen detail komoditas, jadwal penurunan harga terjadwal (`src/lib/data/offer-price-schedule.ts`), dan helper porsi.
  - Redaksi alamat penjemputan lengkap pada endpoint publik demi privasi petani.
  - Tautan langsung menuju halaman profil toko petani.

### 3. Checkout, Pembayaran & Manajemen Pesanan (`(checkout)`)

- **Checkout Dua Fase (`/pasar/checkout`):** Pengelolaan alamat pembeli, kartu kontak, dan pembuatan pesanan.
- **Pembayaran Manual (`/pesanan/[orderId]/bayar`):** Endpoint pembayaran pesanan, status kedaluwarsa, dan hitung mundur waktu bayar.
- **Detail & Siklus Pesanan (`/pesanan/[orderId]`):**
  - Timeline status pesanan (`order-status-timeline.tsx`).
  - Pengajuan jadwal penjemputan (`order-schedule-proposal-card.tsx`), konfirmasi penerimaan barang (`order-receipt-confirmation-card.tsx`), dan akses pesanan pembeli (`buyer-order-access.tsx`).
  - Alur pembatalan pasca-pembayaran serta pengajuan pengaduan dan klarifikasi.

### 4. Autentikasi Pembeli & Onboarding Petani (`(farmer-auth)`, `auth`)

- **Autentikasi Pembeli:** Modal login dan registrasi menggunakan TanStack Form (`buyer-auth-dialog.tsx`), alur reset kata sandi (`buyer-password-reset-form.tsx`), serta dialog pemicu autentikasi otomatis saat pengguna belum login mengakses tautan akun (`buyer-auth-prompt-provider.tsx`, `account-link.tsx`).
- **Autentikasi & Onboarding Petani:**
  - Halaman login petani (`/masuk-petani`) dengan layout terfokus.
  - Alur pendaftaran wajib 6 langkah (`/daftar-petani`): informasi akun, profil lahan, lokasi lahan, komoditas, rekening bank, dan verifikasi (`src/components/auth/farmer/`).

### 5. Profil Toko & Manajemen Petani

- **Toko Petani (`/petani/[farmerId]`):** Halaman profil toko petani publik, daftar penawaran aktif, ringkasan ulasan, serta fitur ikuti (follow) dan penandaan ulasan bermanfaat.
- **Manajemen Petani:** Penambahan skema, tipe (`src/types/api/farmer-management.ts`), rute DB (`farmer-management-routes.ts`), dan hooks (`src/hooks/api/use-farmer-management.ts`).

### 6. Pusat Akun, Favorit, Papan Kebutuhan & Notifikasi

- **Pusat Akun (`/akun/*`):**
  - Shell akun dan navigasi menu header untuk `/akun/profil`, `/akun/alamat`, `/akun/transaksi` (termasuk ekspor transaksi), `/akun/pengaduan`, `/akun/notifikasi`, `/akun/pengaturan`, dan `/akun/verifikasi`.
- **Notifikasi:** Pusat notifikasi pembeli, popover di header, serta dokumentasi sistem notifikasi di `docs/NOTIFICATIONS.md`.
- **Favorit (`/favorit`):** Daftar penawaran tersimpan, sidebar daftar bookmark, dan pengingat (`src/lib/data/reminder-helpers.ts`).
- **Papan Kebutuhan (`/papan-kebutuhan`):** Halaman papan kebutuhan pangan pembeli beserta kontrol filter dan rute API.

### 7. Pusat Informasi, Aksesibilitas, SEO & Layout Global

- **Halaman Informasi & Legal:** `/pusat-informasi`, `/syarat`, `/privasi`, `/bantuan`, `/kontak`, `/pembayaran`, `/pengembalian`, dan `/aksesibilitas`.
- **Provider Global & Layout:** `LocationProvider`, `AccessibilityProvider` (dukungan skala teks adaptif), pembaruan `GlobalHeader` (search bar, location picker, menu akun) dan `GlobalFooter`, serta penghapusan layout `(dashboard)` yang tidak terpakai.
- **SEO:** Kelengkapan metadata, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts`, dan JSON-LD (`src/components/seo/json-ld.tsx`, `src/lib/seo.ts`).

### 8. Komponen UI, Konfigurasi & Pengujian

- **Komponen UI (`src/components/ui/*`):** Penambahan primitive shadcn/Base UI (`accordion`, `alert-dialog`, `breadcrumb`, `calendar`, `carousel`, `dialog`, `dropdown-menu`, `empty`, `popover`, `radio-group`, `select`, `sheet`, `skeleton`, `switch`, `tabs`, dll.).
- **Konfigurasi:** Dukungan origin LAN melalui `src/lib/env.ts`, `.env.example`, dan `next.config.ts`.
- **Pengujian:** Penambahan unit test dan integration test (`buyer-workflows.test.mjs`, `farmer-store.test.mjs`, `profile.test.mjs`, `seo.test.mjs`, `catalog-filters.test.mjs`, `catalog-map-helpers.test.mjs`, `checkout-helpers.test.mjs`, `complaint-helpers.test.mjs`, `offer-detail-helpers.test.mjs`, `order-pickup-helpers.test.mjs`, `auth.test.mjs`, dll.).

---

## Catatan Verifikasi

- `bun run test`: **140 pass, 0 fail** (538 assertions pada 25 file pengujian).
- Pemeriksaan tipe (`bun run next typegen && bun run tsc --noEmit`), linter (`bun run lint`), dan format (`bun run format:check`) dijalankan sebelum pembuatan Pull Request.
