# Design Document

## Overview

To-Do Life Dashboard adalah aplikasi web statis satu halaman (SPA tanpa framework) yang dibangun sepenuhnya dengan HTML, CSS, dan Vanilla JavaScript. Aplikasi berjalan seluruhnya di sisi klien — tidak ada server, tidak ada build tool, tidak ada dependency eksternal. Data persisten disimpan di `localStorage` browser. Arsitektur diarahkan pada kesederhanaan: satu modul JavaScript tunggal (`js/app.js`) yang mengatur semua logika widget dengan pola inisialisasi eksplisit.

## Architecture

### High-Level Structure

```
index.html
├── <link rel="stylesheet" href="css/style.css">
└── <script src="js/app.js">

css/
└── style.css       ← semua styling (layout, widget, animasi)

js/
└── app.js          ← semua logika aplikasi
```

### Module Organization (dalam app.js)

`app.js` diorganisir menjadi beberapa modul logis menggunakan IIFE dan object literals untuk encapsulation, tanpa class ES6 agar kompatibilitas browser maksimal:

```
app.js
├── StorageManager       ← abstraksi baca/tulis localStorage
├── GreetingWidget       ← waktu, tanggal, sapaan, nama custom
├── FocusTimerWidget     ← countdown pomodoro, durasi custom, notifikasi
├── TodoWidget           ← CRUD tugas, sort, persistence
├── QuickLinksWidget     ← CRUD tautan, persistence
└── App.init()           ← entry point, menginisialisasi semua widget
```

### Data Flow

```
User Action
    │
    ▼
Widget Event Handler
    │
    ├──► Update in-memory state
    │
    ├──► StorageManager.save(key, data)
    │
    └──► Re-render DOM
```

Tidak ada event bus global — setiap widget mengelola state-nya sendiri secara independen. Widget tidak berkomunikasi satu sama lain.

## Components and Interfaces

### 1. StorageManager

Abstraksi tipis di atas `localStorage` untuk menghindari duplikasi try/catch dan serialisasi JSON.

**Interface:**

```javascript
const StorageManager = {
  save(key, value) { /* JSON.stringify + setItem */ },
  load(key, defaultValue) { /* getItem + JSON.parse, return defaultValue jika null/error */ }
};
```

**Storage Keys:**

| Key | Type | Description |
|-----|------|-------------|
| `dashboard_user_name` | `string` | Nama custom pengguna |
| `dashboard_timer_duration` | `number` | Durasi Pomodoro dalam menit (1–99) |
| `dashboard_todos` | `Task[]` | Array semua tugas |
| `dashboard_links` | `Link[]` | Array semua quick links |

### 2. GreetingWidget

Menampilkan waktu real-time, tanggal, sapaan kontekstual, dan nama custom yang dapat diedit.

**State:**
```javascript
{
  userName: string,   // dimuat dari storage, default "Pengguna"
  intervalId: number  // ID dari setInterval untuk clock
}
```

**Key Functions:**

```javascript
GreetingWidget = {
  init(),
  formatTime(date),          // Date → "HH:MM"
  formatDate(date),          // Date → "Senin, 25 November 2024"
  getGreeting(hour),         // number → "Selamat Pagi/Siang/Sore/Malam"
  renderGreeting(),          // update DOM dengan waktu/tanggal/sapaan/nama
  saveName(name),            // simpan nama ke storage, re-render
  startClock()               // setInterval setiap 60 detik
};
```

**Greeting Logic:**

| Jam | Sapaan |
|-----|--------|
| 05–11 | Selamat Pagi |
| 12–14 | Selamat Siang |
| 15–17 | Selamat Sore |
| 18–04 | Selamat Malam |

### 3. FocusTimerWidget

Timer countdown Pomodoro dengan konfigurasi durasi, kontrol Start/Stop/Reset, dan notifikasi saat selesai.

**State:**
```javascript
{
  durationMinutes: number,  // durasi aktif (1–99), default 25
  remainingSeconds: number, // sisa waktu dalam detik
  isRunning: boolean,
  intervalId: number        // ID dari setInterval countdown
}
```

**Key Functions:**

```javascript
FocusTimerWidget = {
  init(),
  formatTime(totalSeconds),      // number → "MM:SS"
  validateDuration(value),       // string|number → boolean (1–99)
  start(),
  stop(),
  reset(),
  tick(),                        // decrement remainingSeconds, cek 0
  onComplete(),                  // stop timer, play audio, show notification
  saveDuration(minutes),         // validasi, simpan, update state
  requestNotificationPermission(),
  showNotification(),
  render()                       // update DOM display
};
```

**State Machine:**

```
IDLE ──start()──► RUNNING ──stop()──► PAUSED
  ▲                  │                  │
  │                  │ tick()==0         │
  └────reset()────── ▼ ──────────────► COMPLETED ──reset()──► IDLE
```

### 4. TodoWidget

Manajemen tugas lengkap dengan CRUD, toggle selesai, dan 4 mode pengurutan.

**Task Model:**
```javascript
{
  id: string,         // Date.now().toString() + random suffix
  text: string,       // teks tugas
  completed: boolean, // status selesai
  createdAt: number   // timestamp ms (Date.now())
}
```

**State:**
```javascript
{
  tasks: Task[],      // array in-memory, sumber kebenaran
  sortMode: string    // "active-first" | "done-first" | "newest" | "oldest"
}
```

**Key Functions:**

```javascript
TodoWidget = {
  init(),
  addTask(text),              // validasi non-kosong, buat Task, simpan, render
  deleteTask(id),             // hapus dari array, simpan, render
  toggleTask(id),             // flip completed, simpan, render
  editTask(id, newText),      // update text, simpan, render
  setSortMode(mode),          // update sortMode, render
  getSortedTasks(),           // return tasks[] disortir sesuai sortMode
  save(),                     // StorageManager.save tasks
  render()                    // render seluruh list dari getSortedTasks()
};
```

**Sort Logic:**

| Mode | Algoritma |
|------|-----------|
| `active-first` | completed=false dahulu, lalu completed=true |
| `done-first` | completed=true dahulu, lalu completed=false |
| `newest` | sort descending by `createdAt` |
| `oldest` | sort ascending by `createdAt` |

### 5. QuickLinksWidget

Manajemen koleksi tautan favorit dengan tambah dan hapus.

**Link Model:**
```javascript
{
  id: string,    // Date.now().toString()
  label: string, // teks tampilan tautan
  url: string    // URL target
}
```

**State:**
```javascript
{
  links: Link[]  // array in-memory
}
```

**Key Functions:**

```javascript
QuickLinksWidget = {
  init(),
  addLink(label, url),   // validasi non-kosong, buat Link, simpan, render
  deleteLink(id),        // hapus dari array, simpan, render
  save(),                // StorageManager.save links
  render()               // render semua tautan
};
```

### HTML Structure

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Life Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="dashboard-container">

    <!-- Widget 1: Greeting -->
    <section id="greeting-widget" class="widget">
      <div id="greeting-time"></div>
      <div id="greeting-date"></div>
      <h1 id="greeting-text"></h1>
      <div class="name-edit-area">
        <input id="name-input" type="text" placeholder="Masukkan nama Anda">
        <button id="name-save-btn">Simpan</button>
      </div>
    </section>

    <!-- Widget 2: Focus Timer -->
    <section id="timer-widget" class="widget">
      <div id="timer-display">25:00</div>
      <div class="timer-controls">
        <button id="timer-start-btn">Start</button>
        <button id="timer-stop-btn">Stop</button>
        <button id="timer-reset-btn">Reset</button>
      </div>
      <div class="timer-settings">
        <input id="timer-duration-input" type="number" min="1" max="99">
        <button id="timer-save-duration-btn">Simpan Durasi</button>
        <span id="timer-error-msg" class="error-msg hidden"></span>
      </div>
    </section>

    <!-- Widget 3: To-Do List -->
    <section id="todo-widget" class="widget">
      <div class="todo-input-area">
        <input id="todo-input" type="text" placeholder="Tambah tugas baru...">
        <button id="todo-add-btn">Tambah</button>
      </div>
      <div class="todo-sort-area">
        <select id="todo-sort-select">
          <option value="active-first">Aktif Dahulu</option>
          <option value="done-first">Selesai Dahulu</option>
          <option value="newest">Terbaru Dahulu</option>
          <option value="oldest">Terlama Dahulu</option>
        </select>
      </div>
      <ul id="todo-list"></ul>
    </section>

    <!-- Widget 4: Quick Links -->
    <section id="links-widget" class="widget">
      <div class="links-input-area">
        <input id="link-label-input" type="text" placeholder="Label">
        <input id="link-url-input" type="url" placeholder="https://...">
        <button id="link-add-btn">Tambah</button>
      </div>
      <ul id="links-list"></ul>
    </section>

  </div>
  <script src="js/app.js"></script>
</body>
</html>
```

### DOM Rendering Patterns

**Todo Item (rendered via innerHTML):**
```html
<li class="todo-item [completed]" data-id="[id]">
  <input type="checkbox" class="todo-checkbox" [checked]>
  <span class="todo-text">[text]</span>
  <button class="todo-edit-btn">Edit</button>
  <button class="todo-delete-btn">Hapus</button>
</li>
```

**Link Item (rendered via innerHTML):**
```html
<li class="link-item" data-id="[id]">
  <a href="[url]" target="_blank" rel="noopener noreferrer">[label]</a>
  <button class="link-delete-btn">Hapus</button>
</li>
```

## Data Models

### Task

```javascript
/**
 * @typedef {Object} Task
 * @property {string} id         - Unique identifier (timestamp + random)
 * @property {string} text       - Task description (non-empty)
 * @property {boolean} completed - Completion status
 * @property {number} createdAt  - Unix timestamp in milliseconds
 */
```

### Link

```javascript
/**
 * @typedef {Object} Link
 * @property {string} id    - Unique identifier (timestamp string)
 * @property {string} label - Display label (non-empty)
 * @property {string} url   - Target URL (non-empty)
 */
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| `localStorage` tidak tersedia | `StorageManager.load` mengembalikan `defaultValue`; `save` gagal secara senyap (try/catch) |
| Tambah tugas dengan input kosong | Validasi di `addTask()`: return early, tidak ada error message (sesuai req 3.2) |
| Tambah link dengan label/URL kosong | Validasi di `addLink()`: return early, tidak ada error message (sesuai req 4.2) |
| Durasi timer di luar 1–99 | Tampilkan pesan error di `#timer-error-msg`, tidak menyimpan |
| JSON parse error di localStorage | try/catch di `StorageManager.load`, kembalikan `defaultValue` |
| Browser tidak mendukung Notification API | Check `'Notification' in window` sebelum request permission |
| Audio tidak dapat diputar | Promise rejection dari `audio.play()` diabaikan secara senyap |

## CSS Layout

### Layout Strategy

Satu kolom vertikal, centered, dengan `max-width` untuk keterbacaan di layar lebar:

```css
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem;
}

.widget {
  background: var(--widget-bg);
  border-radius: 12px;
  padding: 1.5rem;
}
```

### Responsive Breakpoints

| Lebar Layar | Behavior |
|-------------|----------|
| 320px–680px | Full-width container, padding berkurang |
| 680px+ | Container fixed 680px, centered |

### CSS Custom Properties (Variables)

```css
:root {
  --bg-color: #1a1a2e;
  --widget-bg: #16213e;
  --accent-color: #0f3460;
  --highlight-color: #e94560;
  --text-primary: #eaeaea;
  --text-muted: #888;
  --font-size-base: 16px;     /* ≥14px sesuai req */
  --font-size-small: 14px;
  --border-radius: 8px;
}
```

## Initialization Flow

```javascript
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});

const App = {
  init() {
    StorageManager; // tidak perlu init, object literal
    GreetingWidget.init();
    FocusTimerWidget.init();
    TodoWidget.init();
    QuickLinksWidget.init();
  }
};
```

Setiap `widget.init()`:
1. Load data dari `StorageManager`
2. Bind event listeners ke elemen DOM
3. Render initial state

## Testing Strategy

Karena aplikasi ini adalah pure client-side static web app tanpa framework dan tanpa backend, semua logika yang dapat diuji dikapsulasi dalam fungsi-fungsi murni (pure functions) di `app.js`. Strategi pengujian mencakup dua lapisan komplementer:

**Unit / Example Tests** — menguji skenario spesifik dan kondisi batas:
- Initial state setiap widget (default 25:00 timer, nama "Pengguna")
- Transisi state timer (IDLE → RUNNING → PAUSED → COMPLETED)
- Perilaku tombol saat timer berjalan (durasi input dinonaktifkan)
- Tautan yang dirender memiliki `target="_blank"` dan `rel="noopener noreferrer"`
- Audio dipanggil saat timer mencapai 00:00
- Browser Notification dibuat saat izin diberikan

**Property-Based Tests** — menguji properti universal di atas ruang input besar:
- Fungsi format waktu/tanggal (semua nilai `Date` dan `totalSeconds` yang valid)
- Logika sapaan (semua jam 0–23)
- Validasi durasi timer (semua bilangan bulat)
- Operasi CRUD tugas (list arbitrari dan string)
- Algoritma sort (list tugas dengan status dan timestamp acak)
- Round-trip persistensi (semua mutasi terhadap tasks dan links)

Karena tidak ada test framework yang dikonfigurasi (sesuai constraints proyek), properties ini berfungsi sebagai spesifikasi formal yang dapat diimplementasikan menggunakan test runner pilihan (misalnya Jest + fast-check) terpisah dari aset aplikasi utama.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Format Correctness

*For any* `Date` object, `formatTime(date)` SHALL produce a string that matches the pattern `HH:MM` where HH is a zero-padded hour (00–23) and MM is a zero-padded minute (00–59).

**Validates: Requirements 1.1**

### Property 2: Greeting Coverage

*For any* hour value in the range 0–23, `getGreeting(hour)` SHALL return exactly one of "Selamat Pagi", "Selamat Siang", "Selamat Sore", or "Selamat Malam", with the correct greeting matching the defined time ranges (05–11 Pagi, 12–14 Siang, 15–17 Sore, 18–04 Malam).

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 3: Name Persistence Round-Trip

*For any* non-empty name string, saving it via `saveName(name)` then loading it from `StorageManager.load('dashboard_user_name')` SHALL return the original name unchanged.

**Validates: Requirements 1.9, 1.10**

### Property 4: Timer Format Correctness

*For any* integer `totalSeconds` in the range 0–5940 (0–99 minutes), `formatTime(totalSeconds)` SHALL produce a string matching `MM:SS` where MM is zero-padded minutes (00–99) and SS is zero-padded seconds (00–59).

**Validates: Requirements 2.1**

### Property 5: Timer Duration Validation

*For any* integer `n`, `validateDuration(n)` SHALL return `true` if and only if `1 ≤ n ≤ 99`. For any integer outside this range, it SHALL return `false` and the duration SHALL NOT be persisted to storage.

**Validates: Requirements 2.9, 2.12**

### Property 6: Timer Duration Persistence Round-Trip

*For any* valid duration `d` where `1 ≤ d ≤ 99`, saving it via `saveDuration(d)` then loading from `StorageManager.load('dashboard_timer_duration')` SHALL return `d`.

**Validates: Requirements 2.10, 2.11**

### Property 7: Task Addition Grows List

*For any* task list and any non-empty, non-whitespace task text, calling `addTask(text)` SHALL increase the list length by exactly 1 and the new task SHALL be present in the list with `completed = false`.

**Validates: Requirements 3.1, 3.2**

### Property 8: Task Completion Toggle

*For any* task, calling `toggleTask(id)` SHALL flip the `completed` property (false → true, true → false), and calling it twice SHALL restore the original `completed` value.

**Validates: Requirements 3.4, 3.5**

### Property 9: Task Edit Updates Text

*For any* task with any `id` in the list and any non-empty `newText`, calling `editTask(id, newText)` SHALL result in the task's `text` property equaling `newText` while all other properties remain unchanged.

**Validates: Requirements 3.6, 3.7**

### Property 10: Task Deletion Removes Item

*For any* task list with at least one task, calling `deleteTask(id)` for a task in the list SHALL decrease the list length by exactly 1 and the deleted task SHALL no longer appear in the list.

**Validates: Requirements 3.8**

### Property 11: Task Persistence Round-Trip

*For any* sequence of task mutations (add, edit, toggle, delete), calling `save()` then `StorageManager.load('dashboard_todos')` SHALL return an array structurally equal to the current in-memory `tasks` array.

**Validates: Requirements 3.9, 3.10**

### Property 12: Sort Preserves Task Count

*For any* task list and any valid sort mode, `getSortedTasks()` SHALL return an array with the same length as the original `tasks` array (no tasks added or removed by sorting).

**Validates: Requirements 3.11, 3.12, 3.13, 3.14**

### Property 13: Sort Active-First Ordering

*For any* task list, when `sortMode = "active-first"`, `getSortedTasks()` SHALL return a list where no completed task appears before any incomplete task.

**Validates: Requirements 3.11**

### Property 14: Sort Done-First Ordering

*For any* task list, when `sortMode = "done-first"`, `getSortedTasks()` SHALL return a list where no incomplete task appears before any complete task.

**Validates: Requirements 3.12**

### Property 15: Sort Newest-First Timestamp Ordering

*For any* task list, when `sortMode = "newest"`, consecutive tasks in `getSortedTasks()` SHALL satisfy `tasks[i].createdAt >= tasks[i+1].createdAt` for all valid `i`.

**Validates: Requirements 3.13**

### Property 16: Sort Oldest-First Timestamp Ordering

*For any* task list, when `sortMode = "oldest"`, consecutive tasks in `getSortedTasks()` SHALL satisfy `tasks[i].createdAt <= tasks[i+1].createdAt` for all valid `i`.

**Validates: Requirements 3.14**

### Property 17: Link Addition Grows List

*For any* links list and any non-empty label and non-empty URL, calling `addLink(label, url)` SHALL increase the list length by exactly 1 and the new link SHALL contain the original `label` and `url` values.

**Validates: Requirements 4.1, 4.2**

### Property 18: Link Deletion Removes Item

*For any* links list with at least one link, calling `deleteLink(id)` for a link in the list SHALL decrease the list length by exactly 1 and the deleted link SHALL no longer appear in the list.

**Validates: Requirements 4.5**

### Property 19: Link Persistence Round-Trip

*For any* sequence of link mutations (add, delete), calling `save()` then `StorageManager.load('dashboard_links')` SHALL return an array structurally equal to the current in-memory `links` array.

**Validates: Requirements 4.6, 4.7**
