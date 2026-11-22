# Rekomendasi Development dan Production

## Development

Samakan lingkungan lokal dengan CI menggunakan Node.js 24 dan Bun 1.4.4. Jalankan perintah dari root Git. Gunakan `bun run start` setelah build jika perlu memeriksa aplikasi secara manual dalam mode produksi.

```bash
bun install --frozen-lockfile
bun run lint
bun run format:check
bun run next typegen
bun run tsc --noEmit
bun run test
bun run build
bash scripts/smoke.sh
```

Pada lingkungan Windows, gunakan `scripts/smoke.ps1` atau `scripts/smoke.cmd` (atau `bun run smoke:windows`).

- Tambahkan tes regresi di dekat perilaku yang diubah, terutama untuk input tidak valid dan kegagalan yang bisa dialami pengguna. Pertimbangkan tes browser saat repo memiliki alur penting bertahap.
- Pertimbangkan menjalankan Oxlint dan pemeriksaan format di CI agar kode dari luar setup Lefthook tetap diperiksa. Saat ini CI menjalankan type check dan build, sedangkan CT menjalankan unit test dan smoke test. [Alur CI, CT, dan CD](../README.md#ci-ct-dan-cd)
- Pertimbangkan `next/font/local` untuk build yang harus berjalan tanpa akses ke Google Fonts. Gunakan file font dengan lisensi distribusi yang sesuai. [Optimasi font Next.js](https://nextjs.org/docs/app/getting-started/fonts)

## Sebelum mengaktifkan production

CD saat ini melewati job deploy sampai target tersedia. Hubungkan target melalui GitHub Actions, sesuai alur tanpa Docker. [Workflow CD](../.github/workflows/cd.yml)

1. Siapkan environment staging dan production dengan konfigurasi terpisah. Gunakan build yang lulus CT jika format artefak dan nilai publik saat build sesuai dengan target. Jika konfigurasi publik mengharuskan build ulang, jalankan CT pada build pengganti sebelum merilisnya. [Variabel lingkungan Next.js](https://nextjs.org/docs/app/guides/environment-variables)
2. Jalankan verifikasi melalui URL HTTPS target setelah deploy. Periksa halaman utama, pemuatan aset, dan alur yang terkena perubahan. Jika menjalankan `next start` sendiri, tempatkan server di belakang reverse proxy. [Checklist production Next.js](https://nextjs.org/docs/app/guides/production-checklist) · [Panduan self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
3. Catat SHA commit dan ID rilis yang aktif. Pantau ketersediaan, rasio HTTP 5xx, dan latensi. Simpan versi terakhir yang sehat di target untuk rollback karena artefak CI saat ini hanya disimpan tujuh hari. Setelah rollback, ulangi verifikasi melalui URL target.
