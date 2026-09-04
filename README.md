# PT. ASASORA BIO HEALTHORA - Website & Katering Online

Platform web resmi **PT. ASASORA BIO HEALTHORA** (`asasorafood.com`): Penyedia Food Service & Katering Halal BPJPH, Nasi Kotak Seminar/Meeting, Nasi Tumpeng, Nasi Bento, Rice Bowl, Paru Sapi Balado khas Asasora, serta Formulir Order Online & Cek Ongkir Otomatis se-Jabodetabek.

---

## 🚀 Fitur Utama

- **Katalog Menu Halal BPJPH & Produk Siap Santap**: Menampilkan menu nasi kotak, bento, tumpeng mini/tampah, lauk olahan paru balado, dilengkapi tombol suka (*real-time like count*).
- **Formulir Pemesanan & Cek Ongkir Otomatis**: Integrasi kalkulator tarif pengiriman (Gojek, Grab, Lalamove, Kurir Toko Asasora) berdasarkan jarak kilometer dari dapur pusat Buaran Indah, Kota Tangerang.
- **Dukungan Multibahasa**: Pilihan Bahasa Indonesia dan Bahasa Inggris secara dinamis.
- **Sistem Invoice & Export PDF/WhatsApp**: Cetak invoice pesanan resmi dalam format PDF (`jspdf`) atau kirim rincian pesanan langsung ke WhatsApp admin.
- **Sinkronisasi Data Real-time (Firebase Firestore + Express Server)**: Sinkronisasi pembaruan katalog, informasi perusahaan, legalitas, dan status pesanan secara real-time.
- **Panel Admin Terintegrasi**: Pengelolaan data produk, review, mitra klien, dokumen legalitas resmi, dan analitik pengunjung.

---

## 🛠️ Prasyarat & Teknologi

- **Node.js**: v18+ atau v20+
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, Server-Sent Events (SSE)
- **Database & Sync**: Firebase Firestore (Opsional / Terintegrasi) & Local Storage Store JSON

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### 1. Klon Repositori
```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi yang dibutuhkan:
- `GEMINI_API_KEY` (Opsional untuk fitur asisten AI)
- `VITE_GA_MEASUREMENT_ID` (Opsional untuk Google Analytics)

### 4. Jalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Aplikasi akan berjalan pada port `http://localhost:3000`.

### 5. Build Produksi
```bash
npm run build
npm start
```

---

## 📁 Struktur Data

Semua data menu, informasi perusahaan, legalitas, serta dokumen mitra yang telah disesuaikan tersimpan rapi dan dipertahankan di:
- `src/data/initialData.ts`: Data master default aplikasi.
- `data/store.json`: Database file lokal untuk penyimpanan persisten Express server.

---

## 📄 Lisensi
Hak Cipta © 2026 PT. ASASORA BIO HEALTHORA. Seluruh hak cipta dilindungi undang-undang.
