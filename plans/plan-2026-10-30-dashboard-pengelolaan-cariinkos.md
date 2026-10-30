# Rencana Implementasi Dashboard Pengelolaan CariinKos

## 1. Tujuan dan Kriteria Penerimaan

Membangun dashboard internal bagi pemilik kos pada frontend Next.js yang sudah ada. Pemilik dapat login, mengelola data kos dan fasilitas, serta dari detail kos mengelola fasilitas terkait, foto, dan kontak. Navbar dan Sidebar merupakan komponen terpisah. Semua operasi mengikuti kontrak `cariinkos-backend/openapi.json`.

Kriteria keberhasilan:

- Pengguna anonim yang membuka `/dashboard` dialihkan ke `/login`; sesi aktif dapat keluar melalui alur logout backend dan Auth.js.
- Login memanggil `POST /login`; logout memanggil `POST /logout` dengan JWT backend.
- Pengelolaan kos, fasilitas, relasi fasilitas, foto, dan kontak menggunakan method serta bentuk request/response OpenAPI.
- JWT backend tidak terpapar ke JavaScript browser, URL, atau `localStorage`.
- Query dan mutasi memakai TanStack Query v5 dengan cache/key yang tepat dan invalidasi setelah perubahan data.
- Navbar, Sidebar, serta konten modul dipisah; UI memiliki state loading, error, kosong, validasi, sukses, konfirmasi penghapusan, aksesibilitas dasar, dan responsif.
- `npm run lint` dan `npm run build` lulus setelah implementasi.

## 2. Pemahaman Proyek Saat Ini

Fakta yang telah diamati:

- Frontend adalah Next.js App Router; entry point yang ada adalah `app/page.tsx`, `app/layout.tsx`, dan `app/globals.css`.
- Dependency frontend mencakup Next.js `16.4.3`, `next-auth` `^4.24.15`, React `19.3.0`, dan `@tanstack/react-query` `^5.105.0`. Script tersedia untuk `dev`, `build`, `start`, dan `lint`; script typecheck terpisah tidak terlihat di `package.json`.
- `cariinkos-frontend/AGENTS.md` menyatakan bahwa perubahan Next.js perlu mengikuti dokumentasi versi terpasang di `node_modules/next/dist/docs/` dan memperingatkan adanya breaking changes.
- `cariinkos-frontend/DESIGN.md` tersedia. Task meminta memakai arahnya seperlunya tanpa menyalin identitas Bandcamp secara literal.
- `cariinkos-backend/openapi.json` menyatakan server development `http://localhost:3000/api/v1`, login mengembalikan JWT dan user, logout membutuhkan Bearer auth, daftar kos mendukung `page`/`per_page`, dan seluruh resource CRUD terlindungi.
- Operasi API mencakup `/kos`, `/facilities`, `/kos/{id}/facilities`, `/kos/{id}/photos`, dan `/kos/{id}/contacts`. Detail kos memuat data relasi fasilitas, kontak, dan foto.
- Task sumber berada pada `cariinkos-frontend/tasks/dashboard-admin.md` dan memberi route UI, pendekatan auth, query, modul, dan acceptance criteria.
- Backend `.agents/Rules.md` mengarahkan struktur arsitektur backend Go/Goravel; aturan itu menjadi konteks kontrak saja dan tidak mengubah arsitektur frontend.

Belum diverifikasi dalam tahap perencanaan ini: semua schema OpenAPI secara menyeluruh, implementasi backend aktual terhadap OpenAPI, versi patch Next.js docs, dan perilaku runtime auth/BFF.

## 3. Cakupan, Pengecualian, dan Asumsi

Cakupan:

- Halaman `/login` dan area `/dashboard` dengan proteksi sesi.
- API login/logout, penyimpanan JWT backend secara server-side, dan server/BFF route untuk request terlindungi.
- Provider TanStack Query, API client, tipe data yang sesuai OpenAPI, halaman daftar/detail/form kos, fasilitas, foto, kontak, dan relasi fasilitas.
- Komponen layout dashboard terpisah: `DashboardShell`, Navbar, Sidebar, serta komponen per fitur.
- State UI, validasi, aksesibilitas, responsivitas, dan verifikasi lint/build serta alur manual.

Di luar cakupan kecuali diminta kemudian:

- Perubahan backend, database/migrasi, perubahan kontrak OpenAPI, deployment, integrasi layanan eksternal selain pemanggilan API yang ada, dan penambahan/upgrade dependency.
- Fitur pencarian atau filter server-side yang tidak tercantum pada kontrak API. Jangan menambahkan kontrol yang mengesankan dukungan API yang tidak ada.
- Statistik dashboard yang tidak disediakan endpoint.

Asumsi/rekomendasi:

- Route UI mengikuti task: `/login`, `/dashboard`, `/dashboard/kos`, `/dashboard/kos/new`, `/dashboard/kos/[id]`, `/dashboard/kos/[id]/edit`, `/dashboard/fasilitas`, dan subroute kos untuk fasilitas, foto, kontak.
- `NEXT_PUBLIC_API_BASE_URL` hanya berisi URL base API; tidak ada token atau secret di variabel publik. Tinjau apakah nama publik memang dibutuhkan, atau gunakan env server-only karena URL API privat tidak perlu dikirim ke browser.
- Auth.js Credentials provider tetap memakai next-auth v4 yang tercantum di dependency; implementasi harus diverifikasi terhadap versi aktual dan Next.js 16.
- TanStack Query dipakai pada UI, sementara cookie/session Auth.js dan server route/BFF menjaga token. Browser berkomunikasi dengan endpoint frontend/BFF, bukan menerima JWT backend.
- Daftar kos memakai pagination `page` dan `per_page` sesuai kontrak; default `1` dan `10`, maksimum `100`.

## 4. Langkah Implementasi

1. **Audit kontrak API sebelum menulis fitur**
   - Baca seluruh operasi dan schema terkait pada `cariinkos-backend/openapi.json`, khususnya `LoginRequest/Response`, `KosRequest/Response`, `FacilityRequest/Response`, relasi fasilitas, multipart foto, kontak, error/validation, pagination, dan keamanan Bearer.
   - Cocokkan method, path, parameter, field wajib/opsional, tipe konten upload, dan status response dengan provider/controller backend bila tersedia.
   - Catat mismatch sebagai blocker/keputusan kontrak; jangan membuat payload tebakan.

2. **Tetapkan konfigurasi dan batas server/client**
   - Baca dokumentasi Next.js 16 yang relevan dari dokumentasi lokal sesuai `AGENTS.md`, serta API next-auth v4 dan TanStack Query yang terpasang melalui dokumentasi lokal yang tersedia atau dependensi aktual.
   - Tentukan env server-only untuk base URL API dan secret Auth.js; tambah validasi konfigurasi saat runtime tanpa mengungkap nilainya.
   - Rancang alur cookie/session Auth.js -> server route/BFF -> backend dengan allowlist method/path agar bearer token tidak dapat dibaca client.

3. **Bangun autentikasi dan proteksi route**
   - Tambahkan konfigurasi Credentials provider dan handler `app/api/auth/[...nextauth]/route.ts` yang sesuai Auth.js v4.
   - `authorize` memanggil `POST /login`, memvalidasi respons, dan menautkan JWT backend ke token/session server-side.
   - Bangun halaman login dengan validasi dan error aman; arahkan login berhasil ke `/dashboard`.
   - Terapkan proteksi pada area dashboard sesuai mekanisme kompatibel Next.js 16; redirect anon ke `/login`.
   - Buat logout yang mencoba `POST /logout` dengan bearer token, kemudian selalu menghapus sesi lokal; tangani token invalid/401 tanpa membiarkan sesi privat tetap aktif.

4. **Bangun API BFF dan TanStack Query**
   - Buat API client server-side dan endpoint BFF yang hanya meneruskan operasi yang diizinkan; ambil token dari sesi server dan bentuk header Bearer di server.
   - Tambahkan provider client TanStack Query pada layout yang sesuai; gunakan QueryClient baru per request/server boundary yang diperlukan dan lifecycle client yang stabil.
   - Definisikan query key dan hooks per resource: daftar/detail kos, fasilitas, relasi fasilitas, foto, kontak. Query key memuat ID dan pagination/filter relevan.
   - Normalisasi error response dan tangani status 401 dengan penghentian sesi/redirect yang tidak membuat loop.
   - Untuk upload foto, teruskan multipart sesuai OpenAPI dan jangan menetapkan boundary secara manual.

5. **Buat kerangka dashboard dan navigasi**
   - Pisahkan route group untuk halaman login dan dashboard bila sesuai struktur App Router.
   - Buat `DashboardShell`, Navbar, Sidebar, dan layout responsif; tandai link aktif berdasarkan pathname, sediakan navigasi keyboard, dan aksi logout yang nyata.
   - Gunakan Bahasa Indonesia. Terapkan `DESIGN.md` sebagai rujukan seperlunya dan tetap sesuaikan tampilan dengan identitas CariinKos.

6. **Implementasikan daftar, detail, dan CRUD kos**
   - Jadikan `/dashboard` ringkasan operasional berbasis daftar kos API tanpa angka statistik palsu.
   - Buat list dengan pagination; detail menampilkan field kos dan relasi yang dikembalikan endpoint.
   - Buat form create/edit dari schema OpenAPI, tampilkan error validasi, feedback sukses/gagal, dan konfirmasi sebelum delete.
   - Invalidasi daftar/detail kos setelah mutasi yang relevan.

7. **Implementasikan fasilitas**
   - Buat CRUD katalog `/facilities` dan `/facilities/{id}` berdasarkan kontrak.
   - Dari detail kos, buat pengelolaan attach/detach fasilitas; invalidasi detail kos dan query relasi setelah perubahan.

8. **Implementasikan foto dan kontak per kos**
   - Buat list/upload/replace/delete foto dengan format multipart, state upload, dan konfirmasi bila penghapusan diperlukan.
   - Buat lihat/simpan/perbarui/hapus kontak pada `/kos/{id}/contacts`; ikuti schema create/update dan validasi server.
   - Invalidasi data foto/kontak dan detail kos setelah mutasi.

9. **Selesaikan aksesibilitas dan state UI**
   - Lengkapi loading, empty, error/retry, validasi, sukses, konfirmasi, focus state, label form, dan semantik tombol/link.
   - Verifikasi layout desktop dan mobile, termasuk sidebar pada viewport kecil dan tidak ada overflow konten.

10. **Verifikasi setelah implementasi**
    - Jalankan `npm run lint` dan `npm run build` setelah mendapat persetujuan untuk command-based verification.
    - Jalankan typecheck hanya jika tersedia mekanisme yang disepakati; jangan mengubah script tanpa persetujuan bila perlu memperluas scope.
    - Uji manual login sukses/gagal, akses anon, akses sesi, alur BFF tanpa token terekspos, CRUD, relasi, upload, logout, 401/404/422, dan refresh halaman.

## 5. File/Komponen yang Mungkin Terdampak

File yang sudah diamati:

- `cariinkos-frontend/app/page.tsx` — starter page saat ini; kemungkinan diganti/diarahkan menjadi route dashboard.
- `cariinkos-frontend/app/layout.tsx` — root layout dan lokasi integrasi provider jika sesuai batas server/client.
- `cariinkos-frontend/app/globals.css` — styling global yang mungkin disesuaikan.
- `cariinkos-frontend/package.json` — dependencies yang tersedia; tidak diubah kecuali ada gap yang disetujui.
- `cariinkos-frontend/AGENTS.md`, `cariinkos-frontend/DESIGN.md` — panduan yang harus ditaati saat implementasi.
- `cariinkos-frontend/tasks/dashboard-admin.md` — requirement sumber.
- `cariinkos-backend/openapi.json` — kontrak API sumber; tidak diubah dalam scope ini.

Path baru yang diusulkan (finalisasi mengikuti dokumentasi Next.js 16 dan desain BFF):

- `app/(auth)/login/page.tsx`
- `app/(dashboard)/dashboard/layout.tsx` dan halaman route modul
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/backend/[...path]/route.ts` atau route BFF eksplisit yang lebih ketat
- `components/providers.tsx`
- `components/dashboard/navbar.tsx`, `sidebar.tsx`, `dashboard-shell.tsx`, dan komponen modul
- `lib/auth.ts`, `lib/api-client.ts`, `lib/query-client.ts`, query/mutation hooks
- `types/` untuk tipe session dan DTO frontend bila memang membantu menjaga kontrak

Semua path di atas adalah usulan, bukan file yang sudah ada.

## 6. Validasi yang Diusulkan

- Lint: `npm run lint` — memastikan aturan ESLint frontend dipenuhi.
- Build: `npm run build` — memeriksa kompilasi, route App Router, dan integrasi server/client.
- Typecheck terpisah jika dapat dilakukan tanpa mengubah konfigurasi; verifikasi script yang tersedia sebelum mengusulkan command.
- Pemeriksaan manual alur autentikasi, redirect, request BFF, tidak tereksposnya JWT, CRUD tiap modul, pagination, multipart upload, invalidasi query, serta status 401/404/422.
- Validasi request/response terhadap OpenAPI dan backend aktual; dokumentasikan ketidakcocokan, bukan menutupinya dengan mock.

Validasi ini belum dijalankan; memerlukan persetujuan terpisah setelah implementasi.

## 7. Risiko dan Kasus Tepi

- Next.js 16 memiliki perubahan API; pola middleware/proxy dan route handler harus mengikuti dokumentasi versi aktual, bukan template lama.
- `next-auth` yang terpasang adalah v4, sehingga contoh Auth.js versi mayor lain tidak dapat langsung digunakan.
- Menyediakan BFF dengan catch-all terlalu terbuka dapat menjadi proxy arbitrer; batasi path dan method yang diteruskan serta validasi parameter.
- JWT backend harus tetap server-side; jangan kirim ke props/client session. Perhatikan juga log request/error agar token tidak tercatat.
- Sesi Auth.js dapat berakhir sementara JWT backend tidak valid/expired; logout lokal harus tetap berhasil.
- Logout backend bisa gagal jaringan; perilaku logout lokal tetap harus mengakhiri sesi dan memberi feedback yang sesuai.
- OpenAPI dapat berbeda dengan implementasi aktual, khususnya tipe konten upload foto, aturan replace/delete, dan validasi kontak.
- Fasilitas mungkin global/shared, sedangkan relasi fasilitas adalah per-kos; UI harus membedakan CRUD katalog dari attach/detach.
- Endpoint selain daftar kos mungkin tidak mendukung pagination/filter; jangan mengirim parameter yang tidak didukung.
- Upload, error validasi, data kosong, dan pemilik tanpa kos memerlukan state yang jelas.

## 8. Pertanyaan Terbuka

Tidak ada keputusan produk yang menghalangi plan. Sebelum implementasi, audit kontrak penuh harus memastikan bentuk respons dan schema semua endpoint. Jika OpenAPI/backend bertentangan secara material, keputusan koreksi kontrak memerlukan persetujuan sebelum mengubah scope ke backend.

## 9. Feedback

Task sumber sudah menetapkan cakupan modul, URL UI, Auth.js v4, TanStack Query, dan kebutuhan pemisahan komponen dengan cukup jelas. Risiko teknis terbesar adalah menjaga pola BFF yang aman sekaligus membuat TanStack Query tetap berfungsi di client, serta kecocokan API Next.js 16/Auth.js v4. Dahulukan audit schema dan desain batas token sebelum membangun form atau proxy; hal ini menghindari UI yang mengikuti kontrak yang belum benar atau kebocoran kredensial.
