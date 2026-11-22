# Gaya Kode

## Kode tanpa komentar

Tulis dan sunting kode sumber, tes, skrip, serta konfigurasi tanpa komentar. Aturan ini mencakup komentar sebaris, blok komentar, JSDoc, TODO, kode yang dikomentari, dan komentar yang menonaktifkan pemeriksaan. Pindahkan alasan desain atau petunjuk operasional ke dokumentasi, dan catat pekerjaan lanjutan di issue. Gunakan nama yang menunjukkan maksud, tipe yang spesifik, dan tes yang menjelaskan perilaku.

Shebang yang menetapkan interpreter dan direktif bahasa seperti `'use client'` tetap digunakan saat diperlukan. Serahkan isi file hasil generasi ke alat yang membuatnya.

## Struktur dan penamaan

- Gunakan TypeScript untuk logika aplikasi dan TSX untuk komponen React. Gunakan nama komponen PascalCase dan nama file huruf kecil, misalnya `Button` dalam `button.tsx`. Ikuti nama file khusus App Router seperti `page.tsx` dan `layout.tsx`.
- Simpan komponen yang dapat dipakai ulang di `src/components/`, primitif shadcn/Base UI di `src/components/ui/`, dan utilitas bersama di `src/lib/`. Gunakan alias `@/` untuk impor lintas direktori di `src/`.
- Gunakan tipe yang sudah ada. Gunakan `unknown` dan lakukan validasi bila bentuk data belum diketahui. Gunakan `import type` untuk impor yang hanya dipakai sebagai tipe.
- Batasi panjang file maksimal 500 baris kode (LOF / lines of file). Jika sebuah file melebihi batas 500 baris, pecah dan refaktor kode menjadi komponen terpisah di `src/components/` atau modul library/helper terpisah di `src/lib/`.

## Pemeriksaan gaya

Ikuti `.prettierrc.json` dengan indentasi dua spasi, petik tunggal untuk string dan atribut JSX, tanpa titik koma di akhir pernyataan, dan trailing comma gaya ES5. Jalankan `bun run lint` untuk Oxlint dan `bun run format:check` untuk Prettier. Untuk memformat satu file, gunakan `bun run prettier --write src/components/ui/button.tsx`.
