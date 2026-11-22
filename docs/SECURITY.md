# Keamanan PanganTani

Untuk melaporkan kerentanan, hubungi tim inti secara privat. Sertakan versi atau SHA commit yang terdampak, kondisi untuk mereproduksi masalah, dan dampaknya. Samarkan data sensitif sebelum mengirim bukti. Ikuti jalur pelaporan di [SECURITY.md](../SECURITY.md).

## Kredensial dan konfigurasi

- Simpan nilai lokal di `.env.local` pada root repo. Simpan kredensial deployment di GitHub Environment Secrets atau pengelola rahasia target produksi. Gunakan kredensial terpisah untuk development dan production.
- Gunakan `NEXT_PUBLIC_` hanya untuk konfigurasi yang boleh dibaca publik. Next.js dapat menyertakan nilainya di bundle browser saat build. Jaga token, kata sandi, dan kunci API tetap di server. [Variabel lingkungan Next.js](https://nextjs.org/docs/app/guides/environment-variables)
- Jauhkan rahasia dan data pengguna dari Git, fixture, log, tangkapan layar, serta artefak build. Jika kredensial terpapar, cabut atau rotasi segera, periksa penggunaannya, dan beri tahu tim secara privat.

## Perubahan aplikasi

- Saat menambah Route Handler atau Server Action, validasi input di server. Gunakan Zod untuk skema data yang perlu dipakai ulang. Periksa autentikasi dan izin terhadap resource di entry point yang menangani permintaan. [Keamanan data Next.js](https://nextjs.org/docs/app/guides/data-security)
- Kirim hanya field yang diperlukan ke browser. Sebelum menambahkan cache pada data pengguna, verifikasi bahwa cache mengisolasi hasil setiap pengguna. [Panduan self-hosting Next.js](https://nextjs.org/docs/app/guides/self-hosting)

## Perubahan GitHub Actions

- Pertahankan `contents: read` untuk CI dan CT. Batasi akses rahasia production dan izin tulis ke job deploy yang berjalan dari `main`. Tinjau perubahan workflow bersama perubahan dependensi dan `bun.lock`. [Keamanan GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use)
- Sebelum mengaktifkan CD production, pertimbangkan pin action pihak ketiga ke SHA commit penuh yang sudah diperiksa. Gunakan OIDC untuk kredensial berumur pendek jika target mendukungnya. [Keamanan GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use)
