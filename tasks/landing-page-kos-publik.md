# Task: Landing Page Kos Publik

## Tujuan

Buat pengalaman publik CariinKos untuk membantu calon penyewa menemukan kos dan memeriksa detailnya. Gunakan Next.js App Router yang sudah ada dan API publik backend. Implementasi harus mengikuti kontrak `../cariinkos-backend/openapi.json`, bukan menebak bentuk payload, filter, atau perilaku backend.

## Rute dan API

| Halaman UI | Fungsi | API utama |
| --- | --- | --- |
| `/` | Halaman utama publik, menampilkan daftar kos | `GET /public/kos?page=&per_page=` |
| `/kos/[id]` | Detail kos | `GET /public/kos/{id}` |

API base URL default pada OpenAPI adalah `http://localhost:3000/api/v1`. Jadikan base URL dapat dikonfigurasi melalui `NEXT_PUBLIC_API_BASE_URL` untuk deployment. Endpoint publik tidak memerlukan autentikasi. Jangan gunakan endpoint dashboard ber-token untuk menampilkan data publik.

Catatan kontrak:

- OpenAPI menuliskan path daftar sebagai `/public/kos` tanpa slash terakhir. Pastikan base URL dan penyambungan path tidak menghasilkan slash ganda; jangan mengandalkan perilaku redirect trailing slash.
- `GET /public/kos` menggunakan response `KosListResponse` dengan `data` dan `meta` (`page`, `per_page`, `total`, `last_page`). Query `page` minimal 1, `per_page` default 10 dan maksimum 100.
- `GET /public/kos/{id}` menggunakan `KosResponse` berisi `data` dan mengembalikan `404` bila tidak ditemukan.
- Schema `Kos` menyediakan nama, alamat administratif, harga bulanan, jumlah kamar tersedia, tipe, deskripsi, fasilitas, kontak, dan foto. `cover_photo` hanya dijelaskan untuk endpoint list; detail menyediakan `photos[]`. Jangan mengasumsikan `cover_photo` ada pada respons detail.
- Ikuti schema aktual OpenAPI untuk optional/null fields. Jangan tampilkan `user_id` atau informasi internal pemilik sebagai konten publik tanpa kebutuhan yang jelas.

## Pengalaman Pengunjung

- Beranda langsung menampilkan kos yang dikembalikan API, bukan hero marketing statis atau data contoh.
- Setiap item kos menampilkan informasi yang membantu membandingkan pilihan, sekurangnya nama, lokasi, harga bulanan, ketersediaan kamar bila tersedia, dan foto bila tersedia.
- Item kos membuka `/kos/[id]` dan detail menampilkan informasi yang tersedia dari response: deskripsi, alamat, tipe kos, harga, ketersediaan, durasi sewa minimum, aturan, galeri foto, fasilitas, kontak, dan tautan peta bila nilainya tersedia.
- Kontak ditampilkan sebagai aksi yang sesuai data (misalnya telepon/WhatsApp hanya jika nomor tersedia). Tautan peta hanya muncul bila `gmaps_link` tersedia. Tidak boleh ada tombol atau tautan yang tidak punya tindakan nyata.
- Gunakan format Rupiah untuk harga dan label Bahasa Indonesia yang jelas. OpenAPI tidak menjelaskan aturan filter status pada endpoint publik; verifikasi implementasi backend bahwa hanya kos yang layak dipublikasikan yang dikembalikan. Jangan mengandalkan filter frontend sebagai pengganti aturan publikasi backend.
- Pagination mengikuti metadata API. Jangan membuat filter lokasi, rentang harga, pencarian, sorting, atau kategori interaktif kecuali ada dukungan API yang terverifikasi atau fitur tersebut diimplementasikan secara benar dari data yang memang sudah dimuat dan batasannya dijelaskan.
- Jangan membuat statistik, ulasan, testimoni, fasilitas, gambar, maupun klaim promosi fiktif. Gunakan foto dari response backend; fallback gambar hanya jika aset fallback proyek yang memang tersedia dan sesuai digunakan.

## Rendering dan Data

- Keputusan implementasi yang direkomendasikan: render halaman list dan detail di server agar konten kos tersedia pada HTML awal dan mudah diindeks mesin pencari. Gunakan `fetch` server-side dengan konfigurasi base URL dan kebijakan cache/revalidasi yang eksplisit serta sesuai kebutuhan data publik.
- Tangani kegagalan API tanpa mengubahnya menjadi daftar kosong seolah request sukses. Sediakan pesan error dan mekanisme coba lagi yang berfungsi.
- Validasi `id` route dan tangani response `404` dengan halaman tidak ditemukan yang sesuai.
- Pertahankan bentuk response backend pada batas API client; normalisasi hanya untuk kebutuhan tampilan, tanpa mengubah kontrak.
- Pastikan metadata halaman detail (title/description) berasal dari data kos yang benar-benar tersedia, dengan fallback yang jujur bila field deskripsi kosong.

## Struktur yang Dituju

Gunakan struktur App Router dan komponen yang sudah ada. Penempatan berikut merupakan panduan, sesuaikan dengan pola repository tanpa menggabungkan semua fitur menjadi satu komponen besar.

```text
app/
  page.tsx
  kos/[id]/page.tsx
components/
  public/...
lib/
  public-kos-api.ts
types/...
```

Route root `/` saat ini mengarahkan pengunjung ke `/dashboard`; ubah perilaku itu agar beranda menjadi landing/listing publik. Pastikan akses `/dashboard` dan autentikasi pemilik kos tetap bekerja seperti sebelumnya. Tautan navigasi ke login/dashboard hanya ditampilkan bila menuju halaman yang memang tersedia.

## Arah Visual dan Aksesibilitas

- Gunakan Bahasa Indonesia untuk antarmuka dan ikuti `DESIGN.md` hanya sejauh sesuai identitas CariinKos. File tersebut mendeskripsikan Bandcamp, jadi jangan menyalin merek, konten, atau identitas Bandcamp secara literal; konfirmasikan arah visual CariinKos sebelum keputusan desain besar.
- Terapkan antislop selama desain/implementasi dan lakukan audit antislop setelah implementasi. Catat alasan singkat untuk keputusan utama tentang warna, tipografi, komposisi, gambar, dan gerak.
- Jangan membuat logo, ilustrasi, avatar, testimoni, atau aset visual baru tanpa arahan; gunakan nama produk sebagai teks dan data foto nyata dari API.
- Pastikan navigasi keyboard, fokus terlihat, kontras teks WCAG AA, target sentuh nyaman, serta layout tanpa overflow pada mobile dan desktop.
- Halaman data menyediakan state loading, kosong, error, sukses, dan 404 yang sesuai. Jangan menampilkan skeleton sebagai pengganti konten permanen atau mencampur error dengan empty state.
- Hindari pola section generik yang tidak melayani penemuan kos. Konten utama dan hasil API harus menjadi fokus visual.

## Tahapan Implementasi

1. Verifikasi operasi publik dan seluruh schema terkait (`Kos`, foto, fasilitas, kontak, pagination, serta error) pada OpenAPI dan cocokkan dengan perilaku backend bila diperlukan.
2. Konfirmasi/tegaskan arah desain CariinKos untuk halaman publik; jangan menganggap `DESIGN.md` Bandcamp sebagai brand guide produk.
3. Buat API client publik dan implementasi server-rendered untuk halaman daftar serta detail.
4. Bangun tampilan listing, navigasi pagination, detail foto/fasilitas/kontak, dan tautan yang tersedia berdasarkan response nyata.
5. Lengkapi status loading, error, empty, retry, dan 404; verifikasi responsivitas serta aksesibilitas keyboard.
6. Pastikan perubahan root tidak merusak login dan dashboard yang sudah ada.
7. Jalankan lint, typecheck (jika tersedia), dan build. Jalankan aplikasi, uji halaman list/detail, pagination, 404, kondisi API gagal, tautan kontak/peta yang tersedia, navigasi mobile, dan interaksi keyboard. Periksa console browser.
8. Audit hasil dengan antislop dan catat temuan/perbaikannya sebelum menyatakan siap.

## Kriteria Penerimaan

- `/` menampilkan data nyata dari `GET /public/kos`; tidak mengalihkan pengunjung ke `/dashboard`.
- Pagination mengirim `page` dan `per_page` sesuai kontrak, serta memakai metadata response untuk navigasi.
- `/kos/[id]` menampilkan data dari `GET /public/kos/{id}` dan menangani ID tidak ditemukan dengan 404.
- Tidak ada autentikasi yang diperlukan untuk halaman publik dan tidak ada JWT dashboard yang terekspos.
- Detail hanya menampilkan field yang tersedia, termasuk fallback foto yang benar, serta aksi kontak/peta hanya bila datanya ada.
- Loading, empty, error/retry, dan not-found memiliki tampilan yang berbeda dan berfungsi.
- Halaman publik responsif, dapat dioperasikan dengan keyboard, dan tidak menampilkan konten atau klaim fiktif.
- Route login dan dashboard yang ada tetap berfungsi.
- `npm run lint` dan `npm run build` lulus.
- Audit antislop selesai, termasuk pemeriksaan semua kontrol yang dapat diinteraksikan dan console browser.
