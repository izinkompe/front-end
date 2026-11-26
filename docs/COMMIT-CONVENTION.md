# Konvensi Commit dan Pull Request

## Pesan commit

Gunakan format Conventional Commits `type(scope): ringkasan` dengan ringkasan dan body berbahasa Indonesia. Scope opsional dan menyebut area yang berubah, misalnya `cart`, `auth`, `rbac`, `dashboard`, `admin`, `farmer`, atau `ui`. Tulis ringkasan dalam satu baris tanpa titik di akhir dan batasi seluruh header hingga 100 karakter sesuai konfigurasi Commitlint. Pecah perubahan besar menjadi beberapa commit terfokus per lapisan atau fitur agar riwayat mudah ditinjau. [Spesifikasi Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

| Tipe                        | Gunakan untuk                                                                |
| --------------------------- | ---------------------------------------------------------------------------- |
| `feat`, `fix`               | Fitur baru atau perbaikan perilaku                                           |
| `docs`, `test`              | Dokumentasi atau pengujian                                                   |
| `style`, `refactor`, `perf` | Penyesuaian tampilan atau format, perapian struktur, atau perbaikan performa |
| `build`, `ci`, `chore`      | Sistem build, workflow, atau pemeliharaan repo                               |

```text
feat(catalog): tambah filter kategori
feat(rbac): terapkan kebijakan akses peran pada dashboard
fix(cart): perbaiki kalkulasi subtotal
ci: jalankan smoke test pada build produksi
docs(commit): perbarui panduan konvensi commit
```

Gunakan body untuk menjelaskan alasan perubahan atau langkah migrasi. Untuk perubahan yang merusak kompatibilitas, gunakan `!` sebelum titik dua pada header atau footer `BREAKING CHANGE:` yang menjelaskan dampaknya. [Spesifikasi Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

## Pemeriksaan sebelum merge

- Mulai dari `main` dan gunakan nama branch yang menyebut perubahan, misalnya `fix/input-harga-null`.
- Jalankan `bun run prepare` jika hook belum terpasang. Lefthook memeriksa dan memformat file staged, menjalankan Commitlint saat commit, serta menjalankan tes Bun saat push.
- Buka PR ke `main`. Ringkas perubahan dan pemeriksaan yang dijalankan. Tautkan issue terkait jika ada dan sertakan tangkapan layar jika membantu peninjauan perubahan visual.
- Tunggu CI dan CT lulus serta minimal satu persetujuan anggota tim sebelum merge. [Panduan kontribusi](../CONTRIBUTING.md)
