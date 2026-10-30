# Task: Dashboard Pengelolaan CariinKos

## Tujuan

Buat dashboard internal untuk pemilik kos agar dapat mengelola data miliknya melalui backend CariinKos. Dashboard menggunakan Next.js App Router yang sudah ada, autentikasi Auth.js (`next-auth` v4 sudah terpasang), dan TanStack Query v5 (sudah terpasang). Kontrak endpoint, skema request/response, parameter, dan kode status harus merujuk ke `../cariinkos-backend/openapi.json`; jangan menebak bentuk payload.

## Konvensi URL

Halaman aplikasi berada di bawah `/dashboard`. URL UI ini adalah keputusan frontend dan bukan endpoint API. Base URL API lokal sesuai OpenAPI adalah `http://localhost:3000/api/v1`; jadikan konfigurasi environment (`NEXT_PUBLIC_API_BASE_URL`) agar dapat diganti di deployment.

| Halaman | Modul | API utama |
| --- | --- | --- |
| `/login` | Autentikasi | `POST /login` |
| `/dashboard` | Ringkasan / daftar kos | `GET /kos?page=&per_page=` |
| `/dashboard/kos` | Daftar kos | `GET /kos?page=&per_page=` |
| `/dashboard/kos/new` | Buat kos | `POST /kos` |
| `/dashboard/kos/[id]` | Detail kos | `GET /kos/{id}` |
| `/dashboard/kos/[id]/edit` | Ubah kos | `PUT /kos/{id}` |
| `/dashboard/fasilitas` | Katalog fasilitas | `GET /facilities` |
| `/dashboard/kos/[id]/fasilitas` | Fasilitas yang terkait dengan kos | `GET/POST /kos/{id}/facilities`, `DELETE /kos/{id}/facilities/{facility_id}` |
| `/dashboard/kos/[id]/foto` | Foto kos | `GET/POST /kos/{id}/photos`, `PUT/DELETE /kos/{id}/photos/{photo_id}` |
| `/dashboard/kos/[id]/kontak` | Kontak kos | `GET/POST/PUT/DELETE /kos/{id}/contacts` |

Operasi detail katalog fasilitas mengikuti OpenAPI: `GET/POST /facilities` dan `GET/PUT/DELETE /facilities/{id}`. Penghapusan kos memakai `DELETE /kos/{id}` dan harus meminta konfirmasi. Setiap operasi harus mengikuti method, body, query, format upload, dan response yang tepat dari spesifikasi; jangan menambahkan endpoint dashboard palsu.

## Struktur file yang dituju

Pertahankan struktur App Router yang ada. Pisahkan route group untuk halaman publik/login dan dashboard terlindungi, serta pecah UI menjadi komponen reusable.

```text
app/
  (auth)/login/page.tsx
  (dashboard)/dashboard/layout.tsx
  (dashboard)/dashboard/page.tsx
  (dashboard)/dashboard/kos/...
  api/auth/[...nextauth]/route.ts
components/
  dashboard/navbar.tsx
  dashboard/sidebar.tsx
  dashboard/dashboard-shell.tsx
  dashboard/...
components/providers.tsx
lib/
  api-client.ts
  auth.ts
  query-client.ts
  queries/...
types/...
```

Nama/penempatan boleh disesuaikan dengan konvensi Next.js versi terpasang, tetapi Navbar, Sidebar, shell/layout, provider, API client, dan fitur modul tidak digabung menjadi satu komponen besar. Konten dashboard disusun untuk pekerjaan operasional: tabel/list kos, pencarian/filter yang benar-benar didukung data, status loading/error/empty, serta form create/edit dan detail. Jangan membuat angka statistik contoh seolah-olah berasal dari API.

## Autentikasi dan sesi

- Buat halaman login di `/login` dengan validasi email/password dan pesan kegagalan yang aman.
- Integrasikan Credentials provider Auth.js sesuai `next-auth` v4 yang terpasang. `authorize` mengirim kredensial ke `POST /login`, memvalidasi respons sesuai `LoginResponse`, lalu menyimpan identitas user dan JWT backend di token/sesi server.
- Kunci route halaman `/dashboard` untuk pengguna terautentikasi. Pengguna tanpa sesi diarahkan ke `/login`; setelah login berhasil arahkan ke `/dashboard`.
- Jangan mengekspos JWT backend ke JavaScript/browser atau menyimpannya di `localStorage`. Semua request terautentikasi harus meneruskan `Authorization: Bearer <token>` dari sisi server melalui pendekatan BFF/server route yang sesuai. Jangan menaruh secret Auth.js di variabel `NEXT_PUBLIC_*`.
- Saat logout, panggil `POST /logout` dengan bearer token sebelum mengakhiri sesi Auth.js. Bersihkan cache query privat dan arahkan ke `/login`; tangani token kedaluwarsa atau respons `401` dengan mengakhiri sesi lokal.
- Ikuti API dan konfigurasi Next.js 16 serta Auth.js v4 yang benar-benar terpasang, bukan contoh untuk versi mayor berbeda. Verifikasi perilaku route protection pada build/runtime.

## Data fetching dan mutasi

- Pasang `QueryClientProvider` melalui provider client yang ditempatkan pada root layout yang sesuai.
- Gunakan TanStack Query untuk daftar/detail, pagination, loading, error, dan invalidasi setelah create/update/delete atau mutasi relasi. Query key harus stabil dan memuat ID/pagination/filter yang relevan.
- Gunakan API client bersama untuk base URL, parsing JSON, error terstruktur, dan header auth; request upload foto menggunakan `multipart/form-data` sesuai OpenAPI dan tidak menetapkan boundary secara manual.
- Jangan mengambil data terlindungi langsung dari client dengan token yang bocor. Rancang jalur server/BFF yang mempertahankan token server-side, sambil tetap memakai TanStack Query untuk cache dan lifecycle data di UI.
- Pagination kos mendukung parameter `page` dan `per_page` (default 1 dan 10; batas `per_page` 100 sesuai OpenAPI). Jangan menganggap endpoint lain memiliki pagination atau filter yang tidak tercantum.

## Navbar, sidebar, dan interaksi

- Navbar menampilkan identitas aplikasi/user dan aksi logout yang berfungsi.
- Sidebar menyediakan navigasi ke ringkasan, kos, dan fasilitas. Modul foto, kontak, dan relasi fasilitas diakses dari detail kos agar selalu memiliki konteks ID kos.
- Navigasi aktif mengikuti pathname; sidebar dapat digunakan pada viewport kecil melalui pola navigasi yang dapat diakses keyboard.
- Konten mengikuti `cariinkos-frontend/DESIGN.md` sejauh relevan, tetapi jangan menyalin identitas Bandcamp secara literal; dashboard tetap konsisten dengan produk CariinKos. Gunakan Bahasa Indonesia untuk label dan pesan antarmuka.
- Sediakan state loading, kosong, error, validasi, sukses, konfirmasi hapus, fokus keyboard, dan tampilan responsif.

## Tahapan implementasi

1. Baca seluruh operasi dan schema terkait di `cariinkos-backend/openapi.json`; catat ketidakcocokan kontrak sebelum implementasi.
2. Buat konfigurasi Auth.js v4, login/logout, session typing seperlunya, serta perlindungan route dashboard.
3. Buat API client/BFF server-side dan provider TanStack Query; pastikan bearer token tidak pernah dikirim ke bundle browser.
4. Buat DashboardShell, Navbar, Sidebar, dan halaman ringkasan/daftar kos dengan pagination API.
5. Implementasikan CRUD kos dan katalog fasilitas berdasarkan schema OpenAPI.
6. Implementasikan pengelolaan fasilitas per kos, foto kos (termasuk upload/ganti), dan kontak kos dari halaman detail kos.
7. Tambahkan validasi, feedback untuk seluruh state, aksesibilitas, serta responsivitas.
8. Jalankan lint, typecheck (jika tersedia), dan build; verifikasi alur login, akses tanpa sesi, CRUD utama, logout, serta penanganan 401.

## Kriteria penerimaan

- Semua halaman terlindungi mengalihkan pengguna anonim ke `/login`; sesi aktif dapat logout dan tidak lagi mengakses dashboard.
- Login menggunakan `POST /login`; logout backend menggunakan `POST /logout` dengan bearer JWT.
- Dashboard dan modul menggunakan endpoint/method/schema OpenAPI tanpa payload atau endpoint karangan.
- CRUD kos dan fasilitas, serta relasi fasilitas/foto/kontak per kos, tersedia dengan state loading/error/empty dan feedback mutasi.
- JWT backend tidak terlihat di client bundle, URL publik, atau `localStorage`.
- Navbar dan Sidebar merupakan komponen terpisah; navigasi aktif, keyboard, dan ukuran mobile berfungsi.
- `npm run lint` dan `npm run build` lulus.

## Catatan kontrak yang perlu diverifikasi

Validasi skema request kontak create/update dan tipe konten upload foto terhadap bagian terkait di OpenAPI. Bila spesifikasi tidak konsisten dengan implementasi backend, dokumentasikan mismatch dan selesaikan kontraknya sebelum mengandalkan perilaku tersebut di UI.
