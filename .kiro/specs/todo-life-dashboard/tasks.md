# Implementation Plan: To-Do Life Dashboard

## Overview

Implementasi aplikasi web statis satu halaman menggunakan HTML, CSS, dan Vanilla JavaScript murni. Tidak ada framework, build tool, atau dependency eksternal. Semua logika dikapsulasi dalam `js/app.js` menggunakan IIFE dan object literals, dengan data persisten di `localStorage`.

## Tasks

- [x] 1. Buat struktur file proyek dan HTML utama
  - Buat `index.html` dengan struktur lengkap sesuai desain (semua 4 widget sections)
  - Buat direktori `css/` dan `js/`
  - Tambahkan referensi ke `css/style.css` dan `js/app.js`
  - _Requirements: 5.1, 5.2_

- [x] 2. Implementasi StorageManager dan kerangka app.js
  - [x] 2.1 Implementasi StorageManager
    - Tulis object `StorageManager` dengan method `save(key, value)` dan `load(key, defaultValue)`
    - Gunakan try/catch untuk menangani kegagalan JSON.parse dan localStorage tidak tersedia
    - _Requirements: 1.9, 1.10, 2.10, 2.11, 3.9, 3.10, 4.6, 4.7_

  - [x] 2.2 Implementasi kerangka App dan entry point
    - Tulis object `App` dengan method `init()` yang memanggil semua widget init
    - Pasang event listener `DOMContentLoaded`
    - _Requirements: 5.1_

- [x] 3. Implementasi GreetingWidget
  - [x] 3.1 Implementasi fungsi-fungsi murni GreetingWidget
    - Tulis `formatTime(date)` yang menghasilkan string `HH:MM` dengan zero-padding
    - Tulis `formatDate(date)` yang menghasilkan string format "Senin, 25 November 2024" (bahasa Indonesia)
    - Tulis `getGreeting(hour)` dengan logika 05–11 Pagi, 12–14 Siang, 15–17 Sore, 18–04 Malam
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 3.2 Tulis property test untuk formatTime (Property 1)
    - **Property 1: Time Format Correctness**
    - Untuk semua objek `Date` yang valid, `formatTime(date)` harus menghasilkan string yang cocok dengan pola `HH:MM`
    - **Validates: Requirements 1.1**

  - [x] 3.3 Tulis property test untuk getGreeting (Property 2)
    - **Property 2: Greeting Coverage**
    - Untuk semua nilai jam 0–23, `getGreeting(hour)` harus mengembalikan tepat satu dari empat sapaan yang benar
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [x] 3.4 Implementasi renderGreeting, saveName, dan startClock
    - Tulis `renderGreeting()` yang mengupdate semua elemen DOM widget greeting
    - Tulis `saveName(name)` yang menyimpan ke storage dan memanggil re-render
    - Tulis `startClock()` menggunakan `setInterval` setiap 60 detik
    - Tulis `init()` yang memuat nama dari storage, bind event listener tombol simpan, dan mulai clock
    - _Requirements: 1.7, 1.8, 1.9, 1.10_

  - [x] 3.5 Tulis property test untuk Name Persistence Round-Trip (Property 3)
    - **Property 3: Name Persistence Round-Trip**
    - Untuk sembarang nama non-kosong, `saveName(name)` lalu `load('dashboard_user_name')` harus mengembalikan nama asli
    - **Validates: Requirements 1.9, 1.10**

- [x] 4. Implementasi FocusTimerWidget
  - [x] 4.1 Implementasi fungsi murni dan validasi FocusTimerWidget
    - Tulis `formatTime(totalSeconds)` yang menghasilkan `MM:SS` untuk rentang 0–5940 detik
    - Tulis `validateDuration(value)` yang mengembalikan `true` hanya untuk integer 1–99
    - _Requirements: 2.1, 2.9, 2.12_

  - [x] 4.2 Tulis property test untuk timer formatTime (Property 4)
    - **Property 4: Timer Format Correctness**
    - Untuk semua integer `totalSeconds` 0–5940, `formatTime(totalSeconds)` harus menghasilkan string `MM:SS`
    - **Validates: Requirements 2.1**

  - [x] 4.3 Tulis property test untuk validateDuration (Property 5)
    - **Property 5: Timer Duration Validation**
    - Untuk sembarang integer `n`, `validateDuration(n)` harus return `true` jika dan hanya jika `1 ≤ n ≤ 99`
    - **Validates: Requirements 2.9, 2.12**

  - [x] 4.4 Implementasi state machine timer (start, stop, reset, tick, onComplete)
    - Tulis `start()`, `stop()`, `reset()`, `tick()`, dan `onComplete()`
    - `tick()` mendekremen `remainingSeconds` dan memanggil `onComplete()` saat mencapai 0
    - `onComplete()` menghentikan timer, memutar audio, dan menampilkan notifikasi browser jika izin diberikan
    - Tulis `requestNotificationPermission()` dan `showNotification()`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 4.5 Implementasi saveDuration, render, dan init FocusTimerWidget
    - Tulis `saveDuration(minutes)` dengan validasi, penyimpanan, dan update state
    - Tulis `render()` untuk mengupdate DOM display
    - Tulis `init()` yang memuat durasi dari storage, bind semua event listener, dan render initial state
    - Saat timer berjalan, nonaktifkan input durasi (Requirements 2.13)
    - _Requirements: 2.9, 2.10, 2.11, 2.12, 2.13_

  - [x] 4.6 Tulis property test untuk Duration Persistence Round-Trip (Property 6)
    - **Property 6: Timer Duration Persistence Round-Trip**
    - Untuk sembarang durasi valid `d` (1–99), `saveDuration(d)` lalu `load('dashboard_timer_duration')` harus mengembalikan `d`
    - **Validates: Requirements 2.10, 2.11**

- [x] 5. Checkpoint — Pastikan semua test lolos
  - Pastikan semua test lolos, tanyakan kepada user jika ada pertanyaan.

- [x] 6. Implementasi TodoWidget
  - [x] 6.1 Implementasi addTask, deleteTask, dan toggleTask
    - Tulis `addTask(text)` dengan validasi non-kosong/non-whitespace, pembuatan objek Task, dan penyimpanan
    - Tulis `deleteTask(id)` untuk menghapus dari array dan menyimpan
    - Tulis `toggleTask(id)` untuk membalik properti `completed` dan menyimpan
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.8, 3.9_

  - [x] 6.2 Tulis property test untuk Task Addition (Property 7)
    - **Property 7: Task Addition Grows List**
    - Untuk sembarang list dan teks non-kosong, `addTask(text)` harus menambah panjang list tepat 1, dengan `completed = false`
    - **Validates: Requirements 3.1, 3.2**

  - [x] 6.3 Tulis property test untuk Task Toggle (Property 8)
    - **Property 8: Task Completion Toggle**
    - Untuk sembarang task, `toggleTask(id)` harus membalik `completed`; dua kali panggilan harus mengembalikan nilai semula
    - **Validates: Requirements 3.4, 3.5**

  - [x] 6.4 Tulis property test untuk Task Deletion (Property 10)
    - **Property 10: Task Deletion Removes Item**
    - Untuk sembarang list dengan minimal satu task, `deleteTask(id)` harus mengurangi panjang list tepat 1 dan task tidak lagi ada di list
    - **Validates: Requirements 3.8**

  - [x] 6.5 Implementasi editTask
    - Tulis `editTask(id, newText)` yang mengupdate properti `text` task tanpa mengubah properti lain
    - Bind tombol edit pada DOM untuk masuk ke mode edit inline
    - _Requirements: 3.6, 3.7_

  - [x] 6.6 Tulis property test untuk Task Edit (Property 9)
    - **Property 9: Task Edit Updates Text**
    - Untuk sembarang task dan `newText` non-kosong, `editTask(id, newText)` harus menghasilkan `task.text === newText` dengan properti lain tidak berubah
    - **Validates: Requirements 3.6, 3.7**

  - [x] 6.7 Implementasi getSortedTasks dan setSortMode
    - Tulis `getSortedTasks()` dengan empat mode: `active-first`, `done-first`, `newest`, `oldest`
    - Tulis `setSortMode(mode)` yang mengupdate state dan memanggil render
    - _Requirements: 3.11, 3.12, 3.13, 3.14_

  - [x] 6.8 Tulis property test untuk Sort Preserves Count (Property 12)
    - **Property 12: Sort Preserves Task Count**
    - Untuk sembarang list dan mode sort yang valid, `getSortedTasks()` harus mengembalikan array dengan panjang yang sama
    - **Validates: Requirements 3.11, 3.12, 3.13, 3.14**

  - [x] 6.9 Tulis property test untuk Sort Active-First (Property 13)
    - **Property 13: Sort Active-First Ordering**
    - Saat `sortMode = "active-first"`, tidak ada task selesai yang muncul sebelum task yang belum selesai
    - **Validates: Requirements 3.11**

  - [x] 6.10 Tulis property test untuk Sort Done-First (Property 14)
    - **Property 14: Sort Done-First Ordering**
    - Saat `sortMode = "done-first"`, tidak ada task belum selesai yang muncul sebelum task yang sudah selesai
    - **Validates: Requirements 3.12**

  - [x] 6.11 Tulis property test untuk Sort Newest-First (Property 15)
    - **Property 15: Sort Newest-First Timestamp Ordering**
    - Saat `sortMode = "newest"`, `tasks[i].createdAt >= tasks[i+1].createdAt` untuk semua `i` yang valid
    - **Validates: Requirements 3.13**

  - [x] 6.12 Tulis property test untuk Sort Oldest-First (Property 16)
    - **Property 16: Sort Oldest-First Timestamp Ordering**
    - Saat `sortMode = "oldest"`, `tasks[i].createdAt <= tasks[i+1].createdAt` untuk semua `i` yang valid
    - **Validates: Requirements 3.14**

  - [x] 6.13 Implementasi save, render, dan init TodoWidget
    - Tulis `save()` menggunakan `StorageManager.save`
    - Tulis `render()` yang merender seluruh list dari `getSortedTasks()` menggunakan innerHTML
    - Tulis `init()` yang memuat tasks dari storage, bind event listener (tambah, Enter key, sort), dan render
    - _Requirements: 3.3, 3.9, 3.10_

  - [x] 6.14 Tulis property test untuk Task Persistence Round-Trip (Property 11)
    - **Property 11: Task Persistence Round-Trip**
    - Untuk sembarang sequence mutasi (add, edit, toggle, delete), `save()` lalu `load('dashboard_todos')` harus mengembalikan array yang identik secara struktural dengan in-memory `tasks`
    - **Validates: Requirements 3.9, 3.10**

- [x] 7. Implementasi QuickLinksWidget
  - [x] 7.1 Implementasi addLink dan deleteLink
    - Tulis `addLink(label, url)` dengan validasi non-kosong, pembuatan objek Link, dan penyimpanan
    - Tulis `deleteLink(id)` untuk menghapus dari array dan menyimpan
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [x] 7.2 Tulis property test untuk Link Addition (Property 17)
    - **Property 17: Link Addition Grows List**
    - Untuk sembarang list dan label/URL non-kosong, `addLink(label, url)` harus menambah panjang list tepat 1 dengan label dan URL yang benar
    - **Validates: Requirements 4.1, 4.2**

  - [x] 7.3 Tulis property test untuk Link Deletion (Property 18)
    - **Property 18: Link Deletion Removes Item**
    - Untuk sembarang list dengan minimal satu link, `deleteLink(id)` harus mengurangi panjang list tepat 1 dan link tidak lagi ada di list
    - **Validates: Requirements 4.5**

  - [x] 7.4 Implementasi save, render, dan init QuickLinksWidget
    - Tulis `save()` menggunakan `StorageManager.save`
    - Tulis `render()` yang merender semua tautan sebagai `<a target="_blank" rel="noopener noreferrer">`
    - Tulis `init()` yang memuat links dari storage, bind event listener tombol tambah dan hapus, dan render
    - _Requirements: 4.3, 4.4, 4.6, 4.7_

  - [x] 7.5 Tulis property test untuk Link Persistence Round-Trip (Property 19)
    - **Property 19: Link Persistence Round-Trip**
    - Untuk sembarang sequence mutasi (add, delete), `save()` lalu `load('dashboard_links')` harus mengembalikan array yang identik secara struktural dengan in-memory `links`
    - **Validates: Requirements 4.6, 4.7**

- [x] 8. Checkpoint — Pastikan semua test lolos
  - Pastikan semua test lolos, tanyakan kepada user jika ada pertanyaan.

- [x] 9. Implementasi CSS styling lengkap
  - [x] 9.1 Implementasi CSS variables, layout dashboard, dan widget base styles
    - Definisikan semua CSS custom properties (warna, ukuran font, border-radius)
    - Implementasi `.dashboard-container` dengan flexbox column dan `max-width: 680px`
    - Implementasi `.widget` dengan background, border-radius, dan padding
    - Pastikan font size minimal 14px untuk semua teks konten
    - _Requirements: 5.3, 5.6_

  - [x] 9.2 Implementasi styling per-widget dan responsivitas
    - Style GreetingWidget: tampilan jam besar, teks tanggal, sapaan, input nama
    - Style FocusTimerWidget: tampilan timer besar, tombol kontrol, input durasi, pesan error
    - Style TodoWidget: input area, sort select, todo items (completed state dengan teks dicoret), tombol edit/hapus
    - Style QuickLinksWidget: input area, link items, tombol hapus
    - Implementasi responsive breakpoints: full-width di 320px–680px, centered 680px+
    - _Requirements: 3.3, 5.3, 5.6_

- [x] 10. Wiring akhir dan validasi
  - [x] 10.1 Integrasi dan wiring semua komponen
    - Pastikan `App.init()` menginisialisasi semua widget dalam urutan yang benar
    - Verifikasi semua storage keys konsisten antara widget dan StorageManager
    - Pastikan semua elemen DOM yang direferensikan di `app.js` ada di `index.html` dengan ID yang benar
    - _Requirements: 5.1, 5.4, 5.5_

  - [x] 10.2 Tulis unit tests untuk skenario integrasi utama
    - Test initial state semua widget (default 25:00 timer, nama "Pengguna")
    - Test transisi state timer (IDLE → RUNNING → PAUSED → COMPLETED)
    - Test tautan yang dirender memiliki `target="_blank"` dan `rel="noopener noreferrer"`
    - _Requirements: 2.2, 2.3, 2.4, 2.6, 1.8, 4.4_

- [ ] 11. Final Checkpoint — Pastikan semua test lolos
  - Pastikan semua test lolos, tanyakan kepada user jika ada pertanyaan.

## Notes

- Task bertanda `*` adalah opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- Semua property test mereferensikan nomor property dari design.md
- Tidak ada test framework yang dikonfigurasi dalam proyek utama; property test dapat diimplementasikan menggunakan Jest + fast-check secara terpisah
- Tautan harus selalu memiliki `target="_blank"` dan `rel="noopener noreferrer"` sesuai desain

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2"] },
    { "id": 1, "tasks": ["3.1", "4.1", "6.1", "7.1", "9.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "4.2", "4.3", "6.2", "6.3", "6.4", "6.5", "6.7", "7.2", "7.3", "9.2"] },
    { "id": 3, "tasks": ["3.4", "4.4", "6.6", "6.8", "6.9", "6.10", "6.11", "6.12", "7.4"] },
    { "id": 4, "tasks": ["3.5", "4.5", "6.13", "7.5"] },
    { "id": 5, "tasks": ["4.6", "6.14", "10.1"] },
    { "id": 6, "tasks": ["10.2"] }
  ]
}
```
