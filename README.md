# PanganTani — Front-End

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Base_Nova-000000)](https://ui.shadcn.com/)
[![Package Manager](https://img.shields.io/badge/Bun-1.4-FBF0DF?logo=bun)](https://bun.sh/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Aplikasi antarmuka pengguna (front-end) untuk platform **PanganTani**, dirancang untuk kebutuhan kompetisi dengan fokus pada performa tinggi, arsitektur modern, aksesibilitas, dan konsistensi kode tingkat industri.

---

## 🛠️ Tech Stack & Ekosistem

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack, React Compiler)
- **Library Inti**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (Theme inline, OKLCH semantic tokens)
- **Komponen UI**: [shadcn/ui](https://ui.shadcn.com) (Style `base-lyra`, Base UI primitives)
- **Runtime & Package Manager**: [Bun](https://bun.sh) v1.4+
- **Quality & Git Automation**:
  - [Lefthook](https://github.com/evilmartians/lefthook): Git hooks manager super cepat
  - [Oxlint](https://oxc.rs/docs/guide/usage/linter.html): High-performance JS/TS/React linter
  - [Commitlint](https://commitlint.js.org/): Penegakan standar Conventional Commits
  - [Prettier](https://prettier.io/): Pemformatan otomatis (single quote, no semicolon, 2 spaces)

---

## 📁 Struktur Direktori

```text
front-end/
├── .agents/skills/      # AI agent skills (shadcn/ui project-scoped)
├── .github/workflows/   # CI, CT, dan CD pipelines
├── public/              # Aset statis & favicon
├── src/
│   ├── app/             # Next.js App Router (pages, layout, globals.css)
│   ├── components/      # Komponen UI umum & modul fitur
│   │   └── ui/          # Komponen primitif shadcn/ui (Button, dll.)
│   └── lib/             # Utility functions (cn, helper)
├── .commitlintrc.json   # Konfigurasi commitlint
├── .oxlintrc.json       # Konfigurasi linter oxlint
├── .prettierrc.json     # Konfigurasi code formatter prettier
├── components.json      # Konfigurasi registry shadcn/ui
├── lefthook.yml         # Konfigurasi git hooks pre-commit & commit-msg
├── LICENSE              # Lisensi GNU General Public License v3.0
└── package.json
```

---

## 🚀 Memulai Pengembangan

### Prasyarat

- [Bun](https://bun.sh/) >= 1.4.0
- [Node.js](https://nodejs.org/) >= 20.0.0

### Instalasi & Menjalankan Lokal

```bash
# 1. Pasang dependensi
bun install

# 2. Sinkronisasi Git Hooks
bun run prepare

# 3. Jalankan server pengembangan
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 📜 Perintah Tersedia (Scripts)

| Perintah               | Deskripsi                                               |
| :--------------------- | :------------------------------------------------------ |
| `bun dev`              | Menjalankan Next.js development server (Turbopack)      |
| `bun run build`        | Membuat build aplikasi untuk produksi                   |
| `bun run start`        | Menjalankan aplikasi hasil build produksi               |
| `bun run lint`         | Menjalankan Oxlint linter pada seluruh file kode        |
| `bun run format`       | Memformat kode menggunakan Prettier                     |
| `bun run format:check` | Memeriksa kepatuhan format Prettier tanpa mengubah file |
| `bun run prepare`      | Memasang / menyinkronkan git hooks Lefthook             |

---

## 🔒 Standar Kode & Git Hooks

Repository ini memiliki otomatisasi git hooks melalui **Lefthook**:

1. **`pre-commit`**:
   - Memeriksa keabsahan kode dengan `oxlint`.
   - Memformat file staging secara otomatis dengan `prettier`.
2. **`commit-msg`**:
   - Memvalidasi pesan commit sesuai [Conventional Commits](https://www.conventionalcommits.org/). Contoh: `feat: tambah halaman dashboard`, `fix: perbaiki validasi form`.

---

## CI, CT, dan CD

GitHub Actions menjalankan CI dan CT pada pull request ke `main` dan push ke `main`. Ketiga workflow menggunakan runner Ubuntu tanpa Docker.

- [CI](.github/workflows/ci.yml) memeriksa tipe TypeScript dan membuat build produksi. Artefak build disimpan selama tujuh hari.
- [CT](.github/workflows/ct.yml) menjalankan unit test Bun dan smoke test HTTP pada build dari run CI yang sama.
- [CD](.github/workflows/cd.yml) hanya dipanggil pada push ke `main` setelah CI dan CT lulus. Job deploy dilewati sampai target yang akan menerima build ditentukan.

Untuk menjalankan pemeriksaan yang sama secara lokal, gunakan Node.js 24 dan Bun 1.4.4.

```bash
bun install --frozen-lockfile
bun run next typegen
bun run tsc --noEmit
bun run test
bun run build
bash scripts/smoke.sh
```

Smoke test memeriksa halaman utama di `127.0.0.1:3100` (pada Windows gunakan `scripts/smoke.ps1` atau `scripts/smoke.cmd`). Atur `PORT` jika port tersebut sedang digunakan.

Untuk mengaktifkan deployment otomatis, ganti langkah placeholder di `cd.yml` dengan langkah deployment untuk target produksi. Jika target memakai build CI, deklarasikan input `artifact_id` di `cd.yml` dan teruskan output job `build` dari `ci.yml`, seperti pada pemanggilan CT. Tambahkan izin dan kredensial yang dibutuhkan target, lalu hapus `if: ${{ false }}` dari job deploy.

---

## 📄 Lisensi & Informasi Proyek

- **Lisensi**: Proyek ini dilindungi di bawah lisensi **[GNU General Public License v3.0 (GPL-3.0)](LICENSE)** — lisensi _strong copyleft_ yang menjamin bahwa seluruh kode turunan atau modifikasi tetap terbuka dan tidak dapat disalahgunakan menjadi closed-source/proprietary.
- **Panduan Kontribusi**: Lihat [CONTRIBUTING.md](CONTRIBUTING.md).
- **Daftar Kontributor**: Lihat [CONTRIBUTORS.md](CONTRIBUTORS.md).
- **Kode Etik**: Lihat [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- **Kebijakan Keamanan**: Lihat [SECURITY.md](SECURITY.md).
