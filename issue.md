# Implementation Plan: User Logout API

Dokumen ini berisi panduan _high-level_ untuk mengimplementasikan fitur API yang bertugas menghapus sesi login pengguna (Logout). Panduan dirancang agar terstuktur dan mudah diubah menjadi barisan _code_.

## 1. Spesifikasi Teknis Target API
- Alamat Route (Endpoint): `DELETE /api/users/logout`
- Autentikasi: Diperlukan (Menggunakan Token JWT/UUID pada Header).
- Target Eksekusi: Menghapus baris data penyimpan sesi dari tabel `Session` di _database_ yang cocok dengan nilai _token_ yang disuplai oleh pengguna.

## 2. Pembuatan Logika Utama (Service Layer)
Seluruh instruksi konektivitas basis-data dan algoritma penyelesaian diletakkan di `src/services/users.service.ts`

**Rincian Implementasi `logoutUser` Service:**
- [ ] Deklarasikan _method_ baru berjuluk `logoutUser` di `UsersService`.
- [ ] Beri _strict typing_ untuk parameternya: menerima parameter tunggal variabel `token` berformat _string_.
- [ ] Tahap Validasi _Database_: Cari referensi ketersediaan token di sistem menggunakan fungsi spesifik (seperti _Prisma query_ `findUnique` ke tabel `Session`).
- [ ] *Validasi Keamanan*: Jika sistem tidak menemukan satupun data yang bersinggungan dengan `token` inputan tersebut, paksakan kode untuk melakukan interupsi / _throw Error_ HTTP **401 Unauthorized** bersama muatan pesan yang harus baku (tegas): `"Unauthorized"`.
- [ ] Tahap Perubahan Status / Penghapusan Data: Jika data ditemukan, perintahkan ORM atau _database_ untuk menghapus _row_ terkait dalam tabel `Session` (tergantung implementasi Anda, contohnya _Prisma query_ `delete`).
- [ ] Return dari fungsi ini cukup berupa balasan *String* tulisan biasa: `"Ok"`.

## 3. Implementasi Kontrol HTTP (Routes Layer)
Buat _mapping_ alur URL Restful dan terima serta balaskan respon dalam file `src/routes/users.routes.ts`

**Rincian Konfigurasi Endpoint:**
- [ ] Tambahkan Method dekorator / instruksi *route definition HTTP DELETE* dengan *sub-path* `/logout`. Ini akan menghasilkan jalinan URL Endpoint absolut di `/api/users/logout`.
- [ ] Ekstrak/tangkap data nilai teks *Headers* milik _request_ pada variable kunci yang dinamai `Authorization`.
- [ ] Lakukan verifikasi manual dini (*pre-check*): Bila header bersifat _null, undefined_ atau tidak diawali awalan baku `Bearer `, stop pengerjaan sistem dan kembalikan respose JSON error persis 401:
  ```json
  {
      "message": "Unauthorized"
  }
  ```
- [ ] Potong dan ambil teks / serial huruf setelah kalimat `"Bearer "` agar kita mendapat nilai *Raw Token*.
- [ ] Teruskan (*Delegate*) eksekusi dari Controller menuju _logic_-nya yakni memanggil method `logoutUser` yang dibuat pada `users.service.ts` sembari menyerahkan *Raw Token* di atas.
- [ ] Pungut data balikan sukses `"Ok"` dari service dan bingkai (*wrap*) strukturnya menjadi JSON respons yang baku:
  ```json
  {
      "data": "Ok"
  }
  ```

## 4. Validasi Pekerjaan (Testing Guide)
Sesudah koding rampung, silakan terapkan _best practices_ ini untuk memastikan kebenarannya:
- [ ] Bangun/kompilasi lagi _backend environment_ nya agar *script* terbaru terbaca (`npm run start:dev` atau `docker-compose up --build -d`).
- [ ] Untuk testing riil: Login kembali _dummy account_ dari *client API* (misal pergunakan Postman).
- [ ] Begitu beroleh _Token_ Login barusan yang valid, pasang *Token* di Headers bagian tab Auth/Bearer.
- [ ] Tembak method *DELETE* ke url `localhost:3000/api/users/logout`. Response *Success* mesti menampilkan `{"data": "Ok"}`.
- [ ] Buka _Prisma Studio_ atau _Database Terminal_, buktikan entri _session_ untuk spesifik _token_ itu sudah tidak berdiaspora / tak lagi tercatat di *table* `Session`.
- [ ] Opsional Uji Pertahanan Celah Keamanan: Tembak method DELETE  ke jalur API sama tetapi pakailah token acak, harapan balasan tentu adalah `{"message": "Unauthorized"}`.
