# Konvensi Commit dan Pull Request

## Pesan commit

Gunakan format Conventional Commits `type(scope): ringkasan`. Seluruh pesan commit (baik ringkasan/subjek maupun isi/body jika ada) **WAJIB selalu menggunakan Bahasa Indonesia saja**. Dilarang menggunakan bahasa Inggris atau mencampur bahasa (campur kode/bahasa gado-gado).

Scope bersifat opsional dan menyebut area atau modul yang berubah, misalnya `keranjang`, `auth`, atau `sidebar`. Tulis ringkasan dalam satu baris tanpa tanda titik di akhir dan batasi seluruh header hingga maksimal 100 karakter sesuai konfigurasi Commitlint. [Spesifikasi Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Aturan Bahasa Indonesia

- **Wajib Bahasa Indonesia**: Tuliskan subjek dan deskripsi commit secara penuh dalam Bahasa Indonesia yang baku, jelas, dan lugas.
- **Hindari Bahasa Campuran**: Dilarang mencampur kosakata bahasa Inggris ke dalam kalimat utama ketika ada padanan kata dalam bahasa Indonesia (contoh: gunakan `tambah`, `perbaiki`, `perbarui`, `integrasikan`, `hapus`, `optimasi`, bukan `add`, `fix`, `update`, `integrate`, `delete`).
- **Tipe Commit Tetap Mengikuti Standar**: Tipe (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`) tetap menggunakan kata kunci bawaan Conventional Commits agar kompatibel dengan validator Commitlint.

| Tipe                        | Gunakan untuk                                                                |
| --------------------------- | ---------------------------------------------------------------------------- |
| `feat`, `fix`               | Fitur baru atau perbaikan perilaku                                           |
| `docs`, `test`              | Dokumentasi atau pengujian                                                   |
| `style`, `refactor`, `perf` | Penyesuaian tampilan atau format, perapian struktur, atau perbaikan performa |
| `build`, `ci`, `chore`      | Sistem build, workflow, atau pemeliharaan repo                               |

### Contoh yang Benar

```text
feat(katalog): tambah filter kategori komoditas
fix(keranjang): perbaiki kalkulasi subtotal harga
refactor(sidebar): pindahkan notifikasi ke dalam sidebar
ci: jalankan uji coba smoke test pada build produksi
docs: perbarui panduan keamanan dan konvensi commit
```

### Contoh yang Dilarang

```text
❌ feat(catalog): add category filter (menggunakan bahasa Inggris)
❌ fix(cart): fix calculation of subtotal (menggunakan bahasa Inggris)
❌ feat(auth): update alur login dengan oauth (campur kode / bahasa gado-gado)
```

Gunakan body (jika diperlukan) untuk menjelaskan latar belakang perubahan atau langkah migrasi dalam bahasa Indonesia. Untuk perubahan yang merusak kompatibilitas, gunakan tanda `!` sebelum titik dua pada header atau sertakan footer `BREAKING CHANGE:` yang menjelaskan dampaknya secara rinci. [Spesifikasi Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

## Pemeriksaan sebelum merge

- Mulai dari `main` dan gunakan nama branch yang menyebut perubahan, misalnya `fix/input-harga-null` atau `feat/notifikasi-sidebar`.
- Jalankan `bun run prepare` jika hook belum terpasang. Lefthook memeriksa dan memformat file staged, menjalankan Commitlint saat commit, serta menjalankan tes Bun saat push.
- Buka PR ke `main`. Ringkas perubahan dan pemeriksaan yang dijalankan dalam bahasa Indonesia. Tautkan issue terkait jika ada dan sertakan tangkapan layar jika membantu peninjauan perubahan visual.
- Tunggu CI dan CT lulus serta minimal satu persetujuan anggota tim sebelum merge. [Panduan kontribusi](../CONTRIBUTING.md)
