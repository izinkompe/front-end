# Pull Request: `dev-dashboard` -> `dev`

## Identifier & Metadata

- **Judul PR:** `feat(dashboard): lengkapi dashboard petani dan admin, rbac proxy guard, dan halaman error global`
- **Branch Sumber:** `dev-dashboard`
- **Branch Target:** `dev`
- **Ringkasan Statistik Perubahan (`git diff --shortstat dev..HEAD`):** 370 file berubah (`+47.707` / `-978` baris)
- **Catatan Relasi Branch:** Branch `dev-dashboard` bercabang di atas `dev-pembeli` (PR #1), sehingga seluruh fitur inti `dev-pembeli` turut tercakup bersama penambahan fitur khusus dashboard, RBAC, autentikasi admin, logo global, dan halaman error.

---

## Ringkasan Perubahan

Pull Request ini menggabungkan implementasi lengkap **Dashboard Petani & Admin** (`/dashboard/**`), **Kebijakan RBAC & Proxy Guard** (`src/lib/auth/rbac.ts`, `src/proxy.ts`), **Autentikasi Admin** (`/masuk-admin`), **Komponen Logo Global (`BrandLogo`)**, serta **Halaman Error Global** (`not-found`, `error`, `global-error`) beserta fondasi alur pembeli, pasar, checkout, akun, dan SEO dari `dev-dashboard` ke `dev`.

---

## Rincian Pembahasan Utama (`dev-dashboard`)

### 1. Dashboard Petani & Admin (`/dashboard/**`)

- **Shell & Navigasi Adaptif Peran (`src/components/dashboard/`):**
  - `DashboardShell`, `DashboardHeader`, `DashboardSidebar` berbasis komponen UI `Sidebar` (`src/components/ui/sidebar.tsx`) dan `Tooltip` (`src/components/ui/tooltip.tsx`), serta hook `use-mobile.ts`.
  - Konfigurasi navigasi berdasarkan peran di `dashboard-nav-config.ts`, komponen `RoleGate` (`role-gate.tsx`), `RelaxedAuthBanner` (`relaxed-auth-banner.tsx`), serta halaman `/dashboard/akses-ditolak`.
- **Halaman Kerja Petani:**
  - Ringkasan dashboard petani (`/dashboard` via `farmer-overview.tsx`).
  - Manajemen kebun (`/dashboard/kebun` via `farmer-farms-view.tsx`).
  - Manajemen penawaran panen (`/dashboard/penawaran` via `farmer-offers-view.tsx`).
  - Manajemen pesanan masuk (`/dashboard/pesanan` via `farmer-orders-view.tsx`).
  - Manajemen profil toko petani (`/dashboard/toko` via `farmer-store-view.tsx`).
- **Halaman Kerja Admin:**
  - Ringkasan dashboard admin (`admin-overview.tsx`).
  - Verifikasi akun & dokumen petani (`/dashboard/admin/verifikasi` via `admin-verifikasi-view.tsx`).
  - Moderasi penawaran komoditas (`/dashboard/admin/moderasi` via `admin-moderasi-view.tsx`).
  - Manajemen pengguna (`/dashboard/admin/pengguna` via `admin-pengguna-view.tsx`).
  - Statistik platform & faktor karbon (`/dashboard/admin/statistik` via `admin-statistik-view.tsx`).

### 2. Kebijakan RBAC, Proxy Guard & Autentikasi Admin

- **RBAC Fail-Closed (`src/lib/auth/rbac.ts`, `src/lib/auth/session-cookies.ts`):**
  - Kebijakan otorisasi berbasis peran untuk memisahkan akses `buyer`, `farmer`, dan `admin` secara fail-closed.
- **Proxy Guard (`src/proxy.ts`):**
  - Proteksi rute `/dashboard/**` dan penerapan header keamanan di level proxy Next.js.
- **Login Admin & Fixture Akun (`src/app/(farmer-auth)/masuk-admin/page.tsx`, `src/components/auth/admin/admin-login-form.tsx`):**
  - Halaman dan formulir login khusus Admin.
  - Pengetatan autentikasi pada adapter DB dan fixture dengan 3 akun Admin dan 3 akun Petani (`src/lib/api/db/fixtures/users.fixture.ts`, `src/lib/api/db/adapter.ts`).
  - Pembaruan konfigurasi `src/lib/env.ts` dan `.env.example`.

### 3. Endpoint API & Hooks Dashboard

- **Admin Routes & Hooks (`src/lib/api/db/admin-routes.ts`, `src/hooks/api/use-admin.ts`, `src/types/api/admin.ts`):**
  - Endpoint verifikasi petani, moderasi penawaran, manajemen pengguna, dan statistik/faktor karbon.
- **Farmer Management & Order Routes (`src/lib/api/db/farmer-management-routes.ts`, `src/lib/api/db/order-routes.ts`, `src/hooks/api/use-farmer.ts`, `src/hooks/api/use-farmer-management.ts`):**
  - Rute dan hook TanStack Query untuk pengelolaan penawaran, kebun, toko, serta pesanan petani.
- **Pengujian RBAC (`src/lib/auth/rbac.test.mjs`, `src/lib/api/db/dashboard-rbac.test.mjs`):**
  - Pengujian unit kebijakan RBAC dan pengujian otorisasi endpoint dashboard.

### 4. Komponen Logo Global & Halaman Error

- **BrandLogo (`src/components/shared/brand-logo.tsx`):**
  - Ekstraksi logo PanganTani menjadi komponen global yang konsisten di `GlobalHeader`, `GlobalFooter`, dan `FarmerAuthShell`.
- **Halaman Error Global (`src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`):**
  - Preset status error & pemetaan galat di `src/lib/data/error-presets.ts`.
  - Komponen `ErrorPageShell` (`src/components/shared/error-page-shell.tsx`) dengan `GlobalLayout` beserta unit test `error-page-shell.test.mjs`.

### 5. Fondasi Fitur Pembeli, Pasar, Checkout & SEO (dari `dev-pembeli`)

- **Beranda & Katalog Pasar:** Hero section dengan autocomplete combobox, etalase kategori, penawaran segera ditutup, sentra panen terdekat, papan kebutuhan pangan, halaman `/pasar` dengan peta radius Leaflet (split view & modal mobile), serta detail penawaran `/pasar/penawaran/[id]`.
- **Checkout, Pesanan & Akun:** Checkout dua fase, pembayaran manual, timeline pesanan, jadwal jemput, konfirmasi penerimaan, pusat akun `/akun/*`, pengaduan pasca-bayar, notifikasi, favorit, dan profil toko petani `/petani/[farmerId]`.
- **Autentikasi & Onboarding:** Modal login/register/reset password pembeli dan alur pendaftaran wajib 6 langkah petani (`/daftar-petani`).
- **Pusat Informasi, Aksesibilitas & SEO:** Halaman `/pusat-informasi`, `/syarat`, `/privasi`, `/bantuan`, `/kontak`, `/aksesibilitas`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `json-ld.tsx`, serta pembaruan `docs/COMMIT-CONVENTION.md` dan `docs/NOTIFICATIONS.md`.

---

## Catatan Verifikasi

- `bun run test`: **152 pass, 0 fail** (659 assertions pada 28 file pengujian).
- `bun run lint`: **0 warnings, 0 errors** (359 file).
- `bun run format:check`: seluruh file sesuai dengan gaya Prettier.
