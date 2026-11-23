# Panduan Kontribusi (Contributing Guidelines)

Terima kasih telah tertarik untuk berkontribusi pada proyek **PanganTani Front-End**! Proyek ini dikembangkan untuk kebutuhan kompetisi dan terbuka bagi kolaborasi tim dengan standar kode yang ketat, modern, dan konsisten.

---

## 📋 Daftar Isi

1. [Kode Etik](#kode-etik)
2. [Alur Kerja Pengembangan (Git Flow)](#alur-kerja-pengembangan-git-flow)
3. [Standar Commit Message](#standar-commit-message)
4. [Standar Gaya Penulisan Kode (Code Style)](#standar-gaya-penulisan-kode-code-style)
5. [Menjalankan Proyek Secara Lokal](#menjalankan-proyek-secara-lokal)
6. [Linter & Code Formatter](#linter--code-formatter)
7. [Proses Pull Request (PR)](#proses-pull-request-pr)

---

## 📜 Kode Etik

Setiap kontributor wajib mematuhi [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) untuk menjaga lingkungan kolaborasi yang inklusif, saling menghormati, dan profesional.

---

## 🌿 Alur Kerja Pengembangan (Git Flow)

1. **Buat Cabang (Branch)** dari cabang utama `main`:
   - Fitur baru: `feat/nama-fitur` (contoh: `feat/katalog-pasar`)
   - Perbaikan bug: `fix/deskripsi-masalah` (contoh: `fix/input-harga-null`)
   - Dokumentasi: `docs/nama-dokumen` (contoh: `docs/api-integration`)
   - Refactor: `refactor/nama-modul` (contoh: `refactor/header-nav`)
   - Konfigurasi/Chore: `chore/nama-tugas` (contoh: `chore/setup-lefthook`)
2. Lakukan perubahan kode secara modular dan berkala.
3. Pastikan hook `pre-commit` dan `commit-msg` berjalan sukses sebelum mengirim push.

---

## 💬 Standar Commit Message

Proyek ini menerapkan standar **Conventional Commits** yang diverifikasi secara otomatis oleh **Commitlint** melalui **Lefthook**. Seluruh pesan commit (ringkasan/subjek maupun isi/body jika ada) **WAJIB selalu menggunakan Bahasa Indonesia saja**. Dilarang menggunakan bahasa Inggris atau mencampur bahasa (campur kode/bahasa gado-gado).

### Format

```text
<type>(<scope opsional>): <deskripsi singkat dalam bahasa indonesia>

[body opsional dalam bahasa indonesia]

[footer opsional]
```

### Tipe Commit (`type`):

- `feat`: Penambahan fitur baru
- `fix`: Perbaikan bug
- `docs`: Perubahan atau penambahan dokumentasi
- `style`: Penyesuaian tampilan/formatting (tanpa mengubah logika kode)
- `refactor`: Restrukturisasi kode tanpa menambah fitur atau mengubah fungsionalitas
- `perf`: Peningkatan performa aplikasi
- `test`: Penambahan atau penyesuaian unit test/integration test
- `chore`: Pemeliharaan dependensi, konfigurasi build, atau tool development

### Contoh yang Benar:

```bash
git commit -m "feat(auth): tambahkan integrasi autentikasi pengguna"
git commit -m "fix(keranjang): perbaiki kalkulasi subtotal harga"
git commit -m "docs: perbarui panduan kontribusi dan konvensi commit"
```

---

## 🎨 Standar Gaya Penulisan Kode (Code Style)

Proyek ini menggunakan konfigurasi **Prettier** yang konsisten:

- **Tanda Petik**: Menggunakan petik satu (`'`) untuk string maupun atribut class JSX (`singleQuote: true`, `jsxSingleQuote: true`).
- **Titik Koma**: Tidak menggunakan titik koma di akhir baris (`semi: false`).
- **Indentasi**: 2 spasi (`tabWidth: 2`, `useTabs: false`).
- **Trailing Comma**: Menggunakan gaya ES5 (`trailingComma: "es5"`).

Semua file staged akan diformat otomatis saat `git commit` via Lefthook.

---

## 🚀 Menjalankan Proyek Secara Lokal

Pastikan Anda telah menginstal **Bun 1.4+** dan **Node.js 20+**.

```bash
# 1. Clone repository
git clone <repository-url>
cd front-end

# 2. Pasang dependensi
bun install

# 3. Sinkronisasi Git Hooks (Lefthook)
bun run prepare

# 4. Jalankan development server
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🔍 Linter & Code Formatter

Sebelum melakukan commit atau push, Anda dapat menjalankan perintah verifikasi:

```bash
# Jalankan Oxlint (linter performa tinggi)
bun run lint

# Format seluruh file dengan Prettier
bun run format

# Periksa status formatting
bun run format:check

# Verifikasi type check TypeScript
bun run tsc --noEmit

# Jalankan build production
bun run build
```

---

## 📬 Proses Pull Request (PR)

1. Pastikan seluruh pengujian lokal berhasil (`lint`, `format:check`, `build`).
2. Buat Pull Request dengan target cabang `main`.
3. Tuliskan ringkasan perubahan yang jelas pada deskripsi PR.
4. Pastikan workflow GitHub Actions (CI & CT) lolos tanpa kegagalan.
5. Dapatkan minimal 1 persetujuan review dari anggota tim sebelum merge.
