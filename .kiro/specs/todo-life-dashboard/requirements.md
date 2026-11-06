# Requirements Document

## Introduction

To-Do Life Dashboard adalah aplikasi web statis yang dibangun dengan HTML, CSS, dan Vanilla JavaScript tanpa framework. Aplikasi ini menyediakan antarmuka dashboard satu kolom yang bersih dan minimal, mencakup empat fitur utama: Greeting dinamis dengan nama custom, Focus Timer berbasis Pomodoro yang dapat dikonfigurasi, To-Do List dengan manajemen tugas lengkap dan pengurutan, serta Quick Links untuk menyimpan tautan favorit. Semua data persisten disimpan di LocalStorage browser. Aplikasi berjalan sepenuhnya di sisi klien tanpa backend, dan kompatibel dengan Chrome, Firefox, Edge, dan Safari.

## Glossary

- **Dashboard**: Halaman web tunggal yang menampilkan semua widget dalam satu kolom vertikal
- **Greeting Widget**: Komponen yang menampilkan waktu, tanggal, sapaan berdasarkan waktu hari, dan nama pengguna
- **Focus Timer**: Komponen timer berbasis Pomodoro dengan durasi yang dapat dikonfigurasi
- **Pomodoro**: Teknik manajemen waktu menggunakan interval kerja terfokus (default 25 menit)
- **To-Do List**: Komponen manajemen tugas untuk menambah, mengedit, menyelesaikan, menghapus, dan mengurutkan tugas
- **Task**: Satu item tugas dalam To-Do List yang memiliki teks, status selesai, dan timestamp pembuatan
- **Quick Links**: Komponen untuk menyimpan dan mengakses tautan URL favorit pengguna
- **Link**: Satu item tautan yang memiliki label tampilan dan URL
- **LocalStorage**: Mekanisme penyimpanan data browser sisi klien yang persisten antar sesi
- **Browser Notification API**: API browser standar untuk menampilkan notifikasi sistem operasi dari halaman web
- **Custom Name**: Nama pengguna yang dapat dikonfigurasi dan disimpan di LocalStorage
- **Session**: Satu periode penggunaan aplikasi dalam satu tab browser

## Requirements

### Requirement 1: Tampilan Greeting Dinamis

**User Story:** As a pengguna, I want to melihat sapaan personal dengan nama saya, waktu, dan tanggal saat ini, so that saya merasa disambut dan selalu mengetahui konteks waktu saat membuka dashboard.

#### Acceptance Criteria

1. THE Greeting Widget SHALL menampilkan waktu saat ini dalam format HH:MM yang diperbarui setiap menit.
2. THE Greeting Widget SHALL menampilkan tanggal saat ini dalam format hari, tanggal bulan tahun (contoh: Senin, 25 November 2024).
3. WHEN waktu saat ini berada antara pukul 05:00 dan 11:59, THE Greeting Widget SHALL menampilkan sapaan "Selamat Pagi".
4. WHEN waktu saat ini berada antara pukul 12:00 dan 14:59, THE Greeting Widget SHALL menampilkan sapaan "Selamat Siang".
5. WHEN waktu saat ini berada antara pukul 15:00 dan 17:59, THE Greeting Widget SHALL menampilkan sapaan "Selamat Sore".
6. WHEN waktu saat ini berada antara pukul 18:00 dan 04:59, THE Greeting Widget SHALL menampilkan sapaan "Selamat Malam".
7. THE Greeting Widget SHALL menampilkan nama custom pengguna sebagai bagian dari teks sapaan.
8. WHEN pengguna belum menyimpan nama custom, THE Greeting Widget SHALL menampilkan nama default "Pengguna".
9. WHEN pengguna mengisi dan menyimpan nama custom melalui input field yang tersedia, THE Dashboard SHALL menyimpan nama tersebut ke LocalStorage.
10. WHEN Dashboard dimuat ulang, THE Greeting Widget SHALL memuat nama custom dari LocalStorage dan menampilkannya.

### Requirement 2: Focus Timer (Pomodoro)

**User Story:** As a pengguna, I want to menggunakan timer Pomodoro dengan durasi yang dapat saya atur sendiri, so that saya dapat mengelola sesi kerja terfokus sesuai kebutuhan dan mendapat notifikasi saat sesi selesai.

#### Acceptance Criteria

1. THE Focus Timer SHALL menampilkan sisa waktu dalam format MM:SS.
2. WHEN Focus Timer pertama kali dimuat, THE Focus Timer SHALL menampilkan durasi default 25:00.
3. WHEN pengguna menekan tombol Start, THE Focus Timer SHALL mulai menghitung mundur setiap detik.
4. WHEN Focus Timer sedang berjalan dan pengguna menekan tombol Stop, THE Focus Timer SHALL menghentikan hitungan mundur tanpa mereset waktu.
5. WHEN Focus Timer dihentikan atau belum dimulai dan pengguna menekan tombol Reset, THE Focus Timer SHALL mengembalikan tampilan waktu ke durasi yang sedang dikonfigurasi.
6. WHEN hitungan mundur mencapai 00:00, THE Focus Timer SHALL berhenti secara otomatis.
7. WHEN hitungan mundur mencapai 00:00, THE Focus Timer SHALL memutar audio notifikasi.
8. WHEN hitungan mundur mencapai 00:00 dan pengguna telah memberikan izin notifikasi browser, THE Focus Timer SHALL menampilkan Browser Notification dengan pesan bahwa sesi Pomodoro telah selesai.
9. WHEN pengguna membuka pengaturan durasi dan mengisi nilai menit antara 1 sampai 99, kemudian menyimpannya, THE Focus Timer SHALL memperbarui durasi timer sesuai nilai yang dimasukkan.
10. WHEN pengguna menyimpan durasi custom, THE Dashboard SHALL menyimpan nilai durasi tersebut ke LocalStorage.
11. WHEN Dashboard dimuat ulang, THE Focus Timer SHALL memuat durasi custom dari LocalStorage dan menetapkannya sebagai durasi aktif.
12. IF pengguna mengisi nilai durasi di luar rentang 1–99 menit, THEN THE Focus Timer SHALL menampilkan pesan kesalahan dan tidak menyimpan nilai tersebut.
13. WHILE Focus Timer sedang berjalan, THE Focus Timer SHALL menonaktifkan kemampuan mengubah durasi.

### Requirement 3: To-Do List

**User Story:** As a pengguna, I want to mengelola daftar tugas saya dengan kemampuan tambah, edit, tandai selesai, hapus, dan urutkan, so that saya dapat melacak dan memprioritaskan pekerjaan secara efektif.

#### Acceptance Criteria

1. WHEN pengguna mengisi teks tugas pada input field dan menekan tombol tambah atau menekan tombol Enter, THE To-Do List SHALL menambahkan tugas baru ke daftar.
2. IF pengguna mencoba menambahkan tugas dengan input field kosong, THEN THE To-Do List SHALL tidak menambahkan tugas dan tidak menampilkan pesan kesalahan.
3. THE To-Do List SHALL menampilkan setiap tugas beserta checkbox status, teks tugas, tombol edit, dan tombol hapus.
4. WHEN pengguna mencentang checkbox pada sebuah tugas, THE To-Do List SHALL menandai tugas tersebut sebagai selesai dengan memberikan tampilan visual yang berbeda (contoh: teks dicoret).
5. WHEN pengguna menghilangkan centang checkbox pada tugas yang sudah selesai, THE To-Do List SHALL mengembalikan status tugas tersebut menjadi belum selesai.
6. WHEN pengguna menekan tombol edit pada sebuah tugas, THE To-Do List SHALL mengaktifkan mode edit yang memungkinkan pengguna mengubah teks tugas tersebut.
7. WHEN pengguna menyimpan perubahan pada mode edit, THE To-Do List SHALL memperbarui teks tugas dengan teks yang baru.
8. WHEN pengguna menekan tombol hapus pada sebuah tugas, THE To-Do List SHALL menghapus tugas tersebut dari daftar secara permanen.
9. THE Dashboard SHALL menyimpan seluruh data tugas ke LocalStorage setiap kali ada perubahan (tambah, edit, selesai, atau hapus).
10. WHEN Dashboard dimuat ulang, THE To-Do List SHALL memuat dan menampilkan semua tugas yang tersimpan dari LocalStorage.
11. WHEN pengguna memilih opsi sort "Aktif Dahulu", THE To-Do List SHALL menampilkan tugas yang belum selesai di bagian atas diikuti tugas yang sudah selesai.
12. WHEN pengguna memilih opsi sort "Selesai Dahulu", THE To-Do List SHALL menampilkan tugas yang sudah selesai di bagian atas diikuti tugas yang belum selesai.
13. WHEN pengguna memilih opsi sort "Terbaru Dahulu", THE To-Do List SHALL menampilkan tugas berdasarkan urutan penambahan dari yang terbaru ke yang terlama.
14. WHEN pengguna memilih opsi sort "Terlama Dahulu", THE To-Do List SHALL menampilkan tugas berdasarkan urutan penambahan dari yang terlama ke yang terbaru.

### Requirement 4: Quick Links

**User Story:** As a pengguna, I want to menyimpan dan mengakses tautan URL favorit saya langsung dari dashboard, so that saya dapat berpindah ke situs yang sering dikunjungi dengan cepat tanpa perlu mengingat atau mencari URL-nya.

#### Acceptance Criteria

1. WHEN pengguna mengisi label dan URL kemudian menekan tombol simpan, THE Quick Links SHALL menambahkan tautan baru ke daftar.
2. IF pengguna mencoba menyimpan tautan dengan label atau URL kosong, THEN THE Quick Links SHALL tidak menambahkan tautan dan tidak menampilkan pesan kesalahan.
3. THE Quick Links SHALL menampilkan setiap tautan sebagai elemen yang dapat diklik dengan label yang ditampilkan.
4. WHEN pengguna mengklik sebuah tautan, THE Dashboard SHALL membuka URL tersebut di tab baru browser.
5. WHEN pengguna menekan tombol hapus pada sebuah tautan, THE Quick Links SHALL menghapus tautan tersebut dari daftar secara permanen.
6. THE Dashboard SHALL menyimpan seluruh data tautan ke LocalStorage setiap kali ada perubahan (tambah atau hapus).
7. WHEN Dashboard dimuat ulang, THE Quick Links SHALL memuat dan menampilkan semua tautan yang tersimpan dari LocalStorage.

### Requirement 5: Struktur File dan Kompatibilitas

**User Story:** As a developer, I want to memiliki struktur file yang terorganisir dan kode yang kompatibel dengan browser modern, so that aplikasi mudah dipelihara dan dapat digunakan oleh pengguna di berbagai browser tanpa masalah.

#### Acceptance Criteria

1. THE Dashboard SHALL terdiri dari satu file HTML utama (index.html), satu file CSS (css/style.css), dan satu file JavaScript (js/app.js).
2. THE Dashboard SHALL berfungsi dengan benar di browser Chrome, Firefox, Edge, dan Safari versi rilis terkini.
3. THE Dashboard SHALL menampilkan layout satu kolom vertikal yang responsif pada lebar layar minimal 320px hingga 1920px.
4. THE Dashboard SHALL dapat dimuat dan digunakan secara penuh tanpa koneksi internet setelah aset pertama kali dimuat (operasional offline).
5. WHEN Dashboard pertama kali dimuat, THE Dashboard SHALL menyelesaikan initial render dalam waktu kurang dari 3 detik pada koneksi standar.
6. THE Dashboard SHALL menggunakan tipografi yang mudah dibaca dengan ukuran font minimal 14px untuk teks konten.
