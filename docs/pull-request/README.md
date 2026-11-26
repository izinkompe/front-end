# Aturan dan Panduan Pull Request

Dokumen ini menetapkan standar pembuatan **Pull Request (PR)** pada repositori **PanganTani Front-End** berdasarkan praktik yang diterapkan pada alur `dev-pembeli -> dev` dan `dev-dashboard -> dev`.

---

## 1. Bahasa

- Seluruh **judul**, **deskripsi**, **catatan verifikasi**, dan **dokumentasi PR** wajib ditulis menggunakan **Bahasa Indonesia** yang jelas, ringkas, dan terstruktur.

---

## 2. Identifier Judul Pull Request

Judul PR wajib menggunakan identifier berbasis **Conventional Commits** sesuai [COMMIT-CONVENTION.md](../COMMIT-CONVENTION.md):

```text
<type>(<scope>): <ringkasan singkat dalam bahasa Indonesia>
```

### Ketentuan Penulisan Judul

- Gunakan tipe yang sesuai (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`).
- Cantumkan `scope` yang jelas untuk mengidentifikasi area/domain utama PR (contoh: `pembeli`, `dashboard`, `pasar`, `auth`, `rbac`).
- Maksimal **100 karakter** dan tanpa tanda titik di akhir kalimat.

### Contoh Judul yang Benar

- `feat(pembeli): lengkapi alur halaman pembeli, pasar, checkout, akun, dan autentikasi petani`
- `feat(dashboard): lengkapi dashboard petani dan admin, rbac proxy guard, dan halaman error global`
- `fix(checkout): perbaiki validasi stok saat perubahan harga`

---

## 3. Struktur dan Kelengkapan Deskripsi PR

Setiap deskripsi PR harus lengkap dan memuat bagian-bagian berikut:

1. **Identifier & Metadata**
   - **Judul PR:** sama dengan judul PR di GitHub.
   - **Branch Sumber → Branch Target:** misalnya `dev-pembeli` → `dev` atau `dev-dashboard` → `dev`.
   - **Ringkasan Statistik Perubahan:** hasil `git diff --shortstat <target>..HEAD` (jumlah file berubah, penambahan, dan penghapusan baris).
   - **Catatan Relasi Branch (opsional):** jelaskan apabila branch sumber bercabang di atas branch fitur lain.
2. **Ringkasan Perubahan**
   - Penjelasan singkat (1–2 paragraf) mengenai tujuan utama dan cakupan fitur atau perbaikan yang dibawa PR.
3. **Rincian Pembahasan**
   - Dikelompokkan secara terstruktur per domain/modul fitur (misalnya Beranda, Katalog Pasar, Checkout, Dashboard, RBAC, API & Hooks, SEO, Pengujian).
   - Sebutkan rute, komponen kunci, endpoint/hooks, atau konfigurasi yang ditambah/diubah secara akurat sesuai implementasi nyata.
4. **Catatan Verifikasi**
   - Cantumkan hasil aktual perintah verifikasi yang dijalankan (`bun run test`, `bun run lint`, `bun run format:check`, dan pemeriksaan tipe bila dijalankan).
   - Jangan mencantumkan status lolos apabila pemeriksaan tidak dijalankan.

---

## 4. Arsip Dokumentasi di Folder `docs/pull-request/`

- Setiap PR wajib memiliki file dokumentasi tersendiri di dalam folder `docs/pull-request/` dengan penamaan:

```text
docs/pull-request/PR-<branch-sumber>-to-<branch-target>.md
```

Contoh yang sudah tersedia:

- [PR-dev-pembeli-to-dev.md](./PR-dev-pembeli-to-dev.md)
- [PR-dev-dashboard-to-dev.md](./PR-dev-dashboard-to-dev.md)

- File dokumentasi PR harus diformat dengan Prettier (`bun run format:check`) dan di-commit menggunakan format Conventional Commits sebelum PR dibuat:

```bash
git add docs/pull-request/PR-<branch-sumber>-to-<branch-target>.md
git commit -m "docs(pr): tambah dokumentasi pull request <branch-sumber> ke <branch-target>"
```

---

## 5. Alur Pemeriksaan dan Pembuatan PR via GitHub CLI

Sebelum membuka PR dengan `gh pr create`, pastikan seluruh langkah berikut terpenuhi:

1. **Verifikasi Kode & Tes**
   - `bun run lint` bebas warning dan error.
   - `bun run format:check` lolos tanpa pelanggaran format Prettier.
   - `bun run test` seluruh unit dan integration test lolos.
   - Pastikan pemeriksaan keamanan pada perubahan staged telah dilakukan sebelum commit.
2. **Push Branch ke Remote**
   ```bash
   git push origin <branch-sumber>
   ```
3. **Buat Pull Request Menggunakan `gh` CLI**
   ```bash
   gh pr create \
     --base <branch-target> \
     --head <branch-sumber> \
     --title "<type>(<scope>): <ringkasan>" \
     --body-file docs/pull-request/PR-<branch-sumber>-to-<branch-target>.md
   ```
4. **Peninjauan & Merge**
   - Tautkan issue terkait dan sertakan tangkapan layar bila membantu peninjauan perubahan visual.
   - Tunggu seluruh pemeriksaan CI/CT lolos dan minimal satu persetujuan anggota tim sebelum melakukan merge.
