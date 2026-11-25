# LaporWA — Template & Formulir Laporan WhatsApp

Aplikasi web untuk menyusun laporan terstruktur (seperti laporan **Situasi Kamtibmas SPKT**, **Serah Terima Piket**, dan **Laporan Kejadian**) dan mengirimkannya langsung ke nomor WhatsApp tujuan atau ke banyak grup WhatsApp.

## Fitur Utama

- **Template Laporan Siap Pakai & Kustom**: Dilengkapi format laporan Situasi Kamtibmas SPKT (1x12 jam), Serah Terima Piket Jaga, dan Laporan Kejadian Cepat, serta mode edit struktur bagian/item.
- **Pengisian Cepat**: Tombol cepat nilai (`NIHIL`, `1 kali`, `-`), pilih shift otomatis (Shift Pagi & Shift Malam), dan perhitungan nama hari Indonesia otomatis dari tanggal.
- **Kirim ke Nomor Tujuan & Multi-Grup WA (>1 Grup)**:
  - Kirim langsung ke nomor WhatsApp tertentu (`wa.me/62...`).
  - Mode **Multi-Grup WA** dengan antrean pelacak status per grup, opsi salin otomatis + buka tautan grup (`chat.whatsapp.com/...`), serta pemilih banyak grup langsung di WhatsApp.
- **Pratinjau Real-Time & Editor Teks Mentah**: Menampilkan format tebal WhatsApp (`*...*`) secara langsung sebelum dikirim.
- **Penyimpanan Lokal**: Template kustom, daftar kontak/grup tujuan, draf formulir, dan riwayat laporan tersimpan di `localStorage` peramban.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Build Produksi

```bash
npm run build
```

Hasil build statis akan tersimpan di folder `dist/`.

## Cara Deploy ke GitHub Pages

Proyek ini sudah dilengkapi workflow otomatis di `.github/workflows/deploy.yml` dan konfigurasi `base: './'` di `vite.config.ts`.

1. Unggah (push) seluruh file proyek ke repository GitHub Anda pada branch `main` atau `master`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit LaporWA"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. Buka repository di GitHub, masuk ke menu **Settings** → **Pages**.
3. Pada bagian **Build and deployment → Source**, pilih **GitHub Actions**.
4. GitHub Actions akan otomatis menjalankan build dan memublikasikan aplikasi Anda ke URL `https://USERNAME.github.io/NAMA-REPO/`.
