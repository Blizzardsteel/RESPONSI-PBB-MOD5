# BookVault – Personal Library & Reading Tracker (PWA)

Tugas Responsi Praktikum Pengembangan Perangkat Bergerak (PPB) - Modul 5

## Data Mahasiswa
- **Nama**: Kevin Novantino Hindiarto
- **NIM**: 21120124140109
- **Kelompok**: 27

---

## 📖 Deskripsi Aplikasi
**BookVault** adalah Progressive Web App (PWA) modern untuk mencatat, melacak, dan mengelola koleksi buku serta progres membaca pengguna. Aplikasi ini dibuat dengan tema orisinil (buku & perpustakaan pribadi) tanpa menyalin konten modul praktikum, namun tetap menggunakan arsitektur teknologi frontend yang setara:
- **Framework**: React 19 + Vite
- **PWA Integration**: `vite-plugin-pwa` + `workbox` (Offline-first precaching & runtime caching)
- **Icons**: Lucide React
- **API Client**: Axios dengan interceptor & fallback offline (localStorage)
- **Deployment**: Vercel ready (`vercel.json` SPA rewrite)

---

## ✨ Fitur & Pemenuhan Syarat Responsi

1. **Navigasi Multi-Halaman (>3 Halaman)**:
   - **Home**: Dashboard statistik koleksi, progres bacaan terkini, dan kartu tips.
   - **Library**: Katalog buku lengkap dengan pencarian, filter genre, filter status membaca, dan sorting.
   - **Wishlist / Reading Tracker**: Halaman khusus untuk buku yang sedang dibaca (*Currently Reading*) dan daftar tunggu (*Want to Read*).
   - **Profile**: Menampilkan identitas mahasiswa, statistik bacaan, genre favorit, dan form personalisasi.
   - **Add Book & Edit Book**: Form lengkap untuk manajemen entri buku.
   - **Book Detail**: Tampilan detail mendalam untuk buku tertentu beserta catatan pribadi.

2. **Halaman Profil**:
   - Memuat identitas wajib: **Nama, NIM, dan Kelompok**.
   - Dilengkapi kartu statistik bacaan (total buku, buku terbaca, estimasi jumlah halaman, dll).

3. **CRUD Fungsional Penuh**:
   - **Create**: Tambah buku baru dengan metadata lengkap (judul, penulis, genre, tahun, halaman, status, rating, catatan).
   - **Read**: Tampilan grid responsif, filter genre dinamis, filter status, dan search bar real-time.
   - **Update**: Edit data buku serta ubah rating bintang dan catatan baca.
   - **Delete**: Hapus buku dari katalog dengan dialog konfirmasi (`ConfirmModal`).
   - Dilengkapi fallback otomatis ke `localStorage` saat offline sehingga CRUD tetap berfungsi.

4. **Fungsionalitas PWA**:
   - Dapat di-install ke layar utama desktop / smartphone (terdapat banner prompt install `PWABadge`).
   - Service worker otomatis melakukan pre-caching asset statis (`sw.js`).
   - Terdapat deteksi status offline dengan banner informatif.
   - Dilengkapi Web App Manifest (`manifest.webmanifest`) dan ikon PNG resolusi 192x192 & 512x512.

