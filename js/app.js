/* Life Dashboard - Application Logic */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // StorageManager
  // Abstraksi tipis di atas localStorage untuk serialisasi JSON
  // dan error handling yang terpusat.
  //
  // Storage keys yang digunakan:
  //   dashboard_user_name      – string
  //   dashboard_timer_duration – number
  //   dashboard_todos          – Task[]
  //   dashboard_links          – Link[]
  // ─────────────────────────────────────────────────────────────
  var StorageManager = {
    /**
     * Simpan nilai ke localStorage sebagai JSON.
     * Gagal secara senyap jika localStorage tidak tersedia.
     *
     * @param {string} key
     * @param {*} value
     */
    save: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // localStorage tidak tersedia atau storage penuh — abaikan senyap
      }
    },

    /**
     * Muat nilai dari localStorage dan parse JSON-nya.
     * Mengembalikan defaultValue jika kunci tidak ada,
     * localStorage tidak tersedia, atau JSON tidak valid.
     *
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    load: function (key, defaultValue) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null) {
          return defaultValue;
        }
        return JSON.parse(raw);
      } catch (e) {
        // localStorage tidak tersedia atau JSON.parse gagal
        return defaultValue;
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GreetingWidget
  // Menampilkan waktu, tanggal, sapaan berdasarkan jam, dan nama
  // pengguna. Waktu diperbarui setiap menit via setInterval.
  // ─────────────────────────────────────────────────────────────
  var GreetingWidget = {
    state: { userName: 'Pengguna', intervalId: null },

    /**
     * Memformat objek Date menjadi string jam:menit dengan zero-padding.
     * Requirement 1.1
     *
     * @param {Date} date
     * @returns {string} Format "HH:MM", contoh: "09:05"
     */
    formatTime: function (date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var hh = hours < 10 ? '0' + hours : '' + hours;
      var mm = minutes < 10 ? '0' + minutes : '' + minutes;
      return hh + ':' + mm;
    },

    /**
     * Memformat objek Date menjadi string tanggal dalam bahasa Indonesia.
     * Requirement 1.2
     *
     * @param {Date} date
     * @returns {string} Format "Senin, 25 November 2024"
     */
    formatDate: function (date) {
      var dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      var monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      var dayName = dayNames[date.getDay()];
      var dayNum = date.getDate();
      var monthName = monthNames[date.getMonth()];
      var year = date.getFullYear();
      return dayName + ', ' + dayNum + ' ' + monthName + ' ' + year;
    },

    /**
     * Mengembalikan sapaan berdasarkan jam dalam sehari.
     * Requirement 1.3 – 1.6
     *
     *   05–11  → "Selamat Pagi"
     *   12–14  → "Selamat Siang"
     *   15–17  → "Selamat Sore"
     *   18–04  → "Selamat Malam"
     *
     * @param {number} hour  Jam dalam format 0–23
     * @returns {string}
     */
    getGreeting: function (hour) {
      if (hour >= 5 && hour <= 11) {
        return 'Selamat Pagi';
      } else if (hour >= 12 && hour <= 14) {
        return 'Selamat Siang';
      } else if (hour >= 15 && hour <= 17) {
        return 'Selamat Sore';
      } else {
        return 'Selamat Malam';
      }
    },

    /**
     * Perbarui semua elemen DOM widget greeting dengan waktu, tanggal,
     * dan sapaan saat ini.
     * Requirements: 1.7, 1.8
     */
    renderGreeting: function () {
      var now = new Date();
      document.getElementById('greeting-time').textContent = this.formatTime(now);
      document.getElementById('greeting-date').textContent = this.formatDate(now);
      document.getElementById('greeting-text').textContent =
        this.getGreeting(now.getHours()) + ', ' + this.state.userName + '!';
    },

    /**
     * Simpan nama pengguna ke storage dan perbarui tampilan.
     * Jika nama kosong/hanya spasi, gunakan default 'Pengguna'.
     * Requirement: 1.9
     *
     * @param {string} name  Nama yang dimasukkan pengguna
     */
    saveName: function (name) {
      var trimmed = name.trim();
      if (trimmed) {
        this.state.userName = trimmed;
      } else {
        this.state.userName = 'Pengguna';
      }
      StorageManager.save('dashboard_user_name', this.state.userName);
      this.renderGreeting();
    },

    /**
     * Mulai clock: render segera lalu perbarui setiap 60 detik.
     * Requirement: 1.10
     */
    startClock: function () {
      var self = this;
      self.renderGreeting(); // render langsung
      self.state.intervalId = setInterval(function () {
        self.renderGreeting();
      }, 60000); // setiap 60 detik
    },

    /**
     * Inisialisasi widget: muat nama dari storage, bind event listener
     * tombol simpan dan Enter key, lalu mulai clock.
     * Requirements: 1.7, 1.8, 1.9, 1.10
     */
    init: function () {
      // Muat nama dari storage (default: 'Pengguna')
      this.state.userName = StorageManager.load('dashboard_user_name', 'Pengguna');

      // Bind tombol simpan dan input nama
      var self = this;
      var saveBtn = document.getElementById('name-save-btn');
      var nameInput = document.getElementById('name-input');

      saveBtn.addEventListener('click', function () {
        self.saveName(nameInput.value);
        nameInput.value = '';
      });

      // Bind Enter key pada input
      nameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          self.saveName(nameInput.value);
          nameInput.value = '';
        }
      });

      // Mulai clock
      this.startClock();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TodoWidget
  // Manajemen tugas lengkap: tambah, hapus, toggle selesai,
  // edit, sort, dan persistensi ke localStorage.
  //
  // Task model:
  //   id        – string (Date.now() + random suffix)
  //   text      – string (teks tugas)
  //   completed – boolean (default false)
  //   createdAt – number (timestamp ms)
  // ─────────────────────────────────────────────────────────────
  var TodoWidget = {
    state: {
      tasks: [],
      sortMode: 'active-first'
    },

    /**
     * Tambahkan tugas baru ke daftar.
     * Jika teks kosong atau hanya whitespace, tidak ada yang dilakukan
     * dan tidak ada pesan kesalahan yang ditampilkan (req 3.2).
     *
     * @param {string} text  Teks tugas yang akan ditambahkan
     */
    addTask: function (text) {
      if (!text || text.trim() === '') {
        return;
      }
      var task = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        text: text.trim(),
        completed: false,
        createdAt: Date.now()
      };
      this.state.tasks.push(task);
      this.save();
      this.render();
    },

    /**
     * Hapus tugas dengan id yang diberikan dari daftar secara permanen.
     * Requirements: 3.8, 3.9
     *
     * @param {string} id  ID tugas yang akan dihapus
     */
    deleteTask: function (id) {
      this.state.tasks = this.state.tasks.filter(function (task) {
        return task.id !== id;
      });
      this.save();
      this.render();
    },

    /**
     * Balik status completed pada tugas dengan id yang diberikan.
     * false → true, true → false.
     * Requirements: 3.4, 3.5
     *
     * @param {string} id  ID tugas yang akan di-toggle
     */
    toggleTask: function (id) {
      var task = null;
      for (var i = 0; i < this.state.tasks.length; i++) {
        if (this.state.tasks[i].id === id) {
          task = this.state.tasks[i];
          break;
        }
      }
      if (task) {
        task.completed = !task.completed;
        this.save();
        this.render();
      }
    },

    /**
     * Edit teks tugas dengan id yang diberikan.
     * Jika teks baru kosong atau hanya whitespace, tidak ada yang dilakukan.
     * Requirements: 3.6, 3.7
     *
     * @param {string} id       ID tugas yang akan diedit
     * @param {string} newText  Teks baru untuk tugas
     */
    editTask: function (id, newText) {
      if (!newText || newText.trim() === '') {
        return;
      }
      var task = null;
      for (var i = 0; i < this.state.tasks.length; i++) {
        if (this.state.tasks[i].id === id) {
          task = this.state.tasks[i];
          break;
        }
      }
      if (task) {
        task.text = newText.trim();
        this.save();
        this.render();
      }
    },

    /**
     * Kembalikan salinan tasks yang diurutkan sesuai sortMode saat ini.
     * Modes (harus cocok dengan nilai <option> di HTML):
     *   'active-first' – tugas aktif (belum selesai) lebih dulu, lalu selesai
     *   'done-first'   – tugas selesai lebih dulu, lalu aktif
     *   'oldest'       – urut berdasarkan createdAt ascending (terlama dahulu)
     *   'newest'       – urut berdasarkan createdAt descending (terbaru dahulu)
     * Requirements: 3.11, 3.12, 3.13, 3.14
     *
     * @returns {Array} Salinan tasks yang telah diurutkan
     */
    getSortedTasks: function () {
      var tasks = this.state.tasks.slice();
      var mode = this.state.sortMode;

      if (mode === 'active-first') {
        tasks.sort(function (a, b) {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
      } else if (mode === 'done-first') {
        tasks.sort(function (a, b) {
          if (a.completed === b.completed) return 0;
          return a.completed ? -1 : 1;
        });
      } else if (mode === 'oldest') {
        tasks.sort(function (a, b) {
          return a.createdAt - b.createdAt;
        });
      } else if (mode === 'newest') {
        tasks.sort(function (a, b) {
          return b.createdAt - a.createdAt;
        });
      }

      return tasks;
    },

    /**
     * Atur mode pengurutan tasks dan re-render daftar.
     * Requirements: 3.11, 3.12, 3.13, 3.14
     *
     * @param {string} mode  Salah satu dari: 'active-first', 'done-first',
     *                       'oldest', 'newest'
     */
    setSortMode: function (mode) {
      this.state.sortMode = mode;
      this.render();
    },

    /**
     * Simpan array tasks ke localStorage.
     * Requirements: 3.9
     */
    save: function () {
      StorageManager.save('dashboard_todos', this.state.tasks);
    },

    /**
     * Render seluruh daftar tugas ke elemen #todo-list.
     * Menggunakan getSortedTasks() untuk urutan tampilan.
     * Requirements: 3.3, 3.9, 3.10
     */
    render: function () {
      var listEl = document.getElementById('todo-list');
      if (!listEl) return;
      var self = this;
      var sorted = this.getSortedTasks();

      listEl.innerHTML = '';
      sorted.forEach(function (task) {
        var li = document.createElement('li');
        li.className = 'todo-item' + (task.completed ? ' completed' : '');
        li.setAttribute('data-id', task.id);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function () {
          self.toggleTask(task.id);
        });

        var span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = task.text;

        var editBtn = document.createElement('button');
        editBtn.className = 'todo-edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
          var newText = prompt('Edit tugas:', task.text);
          if (newText !== null && newText.trim() !== '') {
            self.editTask(task.id, newText.trim());
          }
        });

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete-btn';
        deleteBtn.textContent = 'Hapus';
        deleteBtn.addEventListener('click', function () {
          self.deleteTask(task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        listEl.appendChild(li);
      });
    },

    /**
     * Inisialisasi widget: muat tasks dari storage, bind event listener
     * (tambah, Enter key, sort), dan render.
     * Requirements: 3.3, 3.9, 3.10
     */
    init: function () {
      // Muat tasks dari storage
      this.state.tasks = StorageManager.load('dashboard_todos', []);

      var self = this;
      var addBtn = document.getElementById('todo-add-btn');
      var todoInput = document.getElementById('todo-input');
      var sortSelect = document.getElementById('todo-sort-select');

      // Bind tombol tambah
      if (addBtn) {
        addBtn.addEventListener('click', function () {
          self.addTask(todoInput.value);
          todoInput.value = '';
        });
      }

      // Bind Enter key pada input
      if (todoInput) {
        todoInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            self.addTask(todoInput.value);
            todoInput.value = '';
          }
        });
      }

      // Bind sort select
      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          self.setSortMode(sortSelect.value);
        });
      }

      // Render state awal
      this.render();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // QuickLinksWidget
  // Mengelola daftar tautan cepat (Quick Links): tambah, hapus,
  // simpan ke LocalStorage, dan render.
  //
  // Link model:
  //   id    – string (Date.now().toString())
  //   label – string (teks tampilan tautan)
  //   url   – string (URL target)
  // ─────────────────────────────────────────────────────────────
  var QuickLinksWidget = {
    state: {
      links: []
    },

    /**
     * Tambahkan tautan baru ke daftar.
     * Req 4.1: menambahkan tautan jika label dan URL diisi.
     * Req 4.2: diam-diam abaikan jika label atau URL kosong,
     *          tanpa menampilkan pesan kesalahan.
     * Req 4.6: simpan ke LocalStorage setelah perubahan.
     *
     * @param {string} label - Teks tampilan tautan
     * @param {string} url   - URL target tautan
     */
    addLink: function (label, url) {
      if (!label || label.trim() === '' || !url || url.trim() === '') {
        return;
      }

      var newLink = {
        id: Date.now().toString(),
        label: label.trim(),
        url: url.trim()
      };

      this.state.links.push(newLink);
      this.save();
      this.render();
    },

    /**
     * Hapus tautan dengan id yang diberikan dari daftar secara permanen.
     * Req 4.5: menghapus tautan dari daftar secara permanen.
     * Req 4.6: simpan ke LocalStorage setelah perubahan.
     *
     * @param {string} id - ID tautan yang akan dihapus
     */
    deleteLink: function (id) {
      this.state.links = this.state.links.filter(function (link) {
        return link.id !== id;
      });
      this.save();
      this.render();
    },

    /**
     * Simpan state links saat ini ke LocalStorage.
     * Req 4.6: persistensi setiap ada perubahan (tambah/hapus).
     */
    save: function () {
      StorageManager.save('dashboard_links', this.state.links);
    },

    /**
     * Render daftar tautan ke elemen #links-list.
     * Setiap tautan dirender sebagai <a target="_blank" rel="noopener noreferrer">
     * disertai tombol hapus.
     * Req 4.3: tampilkan tautan yang dapat diklik.
     * Req 4.4: buka tautan di tab baru.
     * Req 4.7: tampilkan tombol hapus per tautan.
     */
    render: function () {
      var listEl = document.getElementById('links-list');
      if (!listEl) return;
      var self = this;
      listEl.innerHTML = '';

      this.state.links.forEach(function (link) {
        var li = document.createElement('li');
        li.className = 'link-item';
        li.setAttribute('data-id', link.id);
        li.innerHTML =
          '<a href="' + self.escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer">' +
          self.escapeHtml(link.label) + '</a>' +
          '<button class="link-delete-btn" data-id="' + link.id + '">Hapus</button>';
        listEl.appendChild(li);
      });

      // Bind delete buttons
      listEl.querySelectorAll('.link-delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.deleteLink(btn.getAttribute('data-id'));
        });
      });
    },

    /**
     * Escape karakter HTML khusus untuk mencegah XSS saat menyisipkan
     * teks sebagai innerHTML.
     *
     * @param {string} str
     * @returns {string}
     */
    escapeHtml: function (str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Inisialisasi widget: muat links dari storage, bind event listener
     * tombol tambah, lalu render.
     * Req 4.6: muat state tersimpan saat init.
     * Req 4.3, 4.7: render tautan dan tombol hapus.
     */
    init: function () {
      // Muat links dari storage
      this.state.links = StorageManager.load('dashboard_links', []);

      var self = this;
      var addBtn = document.getElementById('link-add-btn');
      var labelInput = document.getElementById('link-label-input');
      var urlInput = document.getElementById('link-url-input');

      addBtn.addEventListener('click', function () {
        self.addLink(labelInput.value, urlInput.value);
        labelInput.value = '';
        urlInput.value = '';
      });

      // Render state awal
      this.render();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FocusTimerWidget
  // Timer countdown Pomodoro dengan konfigurasi durasi, kontrol
  // Start/Stop/Reset, dan notifikasi saat selesai.
  // ─────────────────────────────────────────────────────────────
  var FocusTimerWidget = {
    state: {
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      isRunning: false,
      intervalId: null
    },

    /**
     * Mengubah total detik menjadi string format "MM:SS" dengan zero-padding.
     * Input yang valid: integer 0–5940 (00:00 sampai 99:00).
     * Requirements: 2.1
     *
     * @param {number} totalSeconds  Integer 0–5940
     * @returns {string} e.g. "25:00", "09:05", "00:00"
     */
    formatTime: function (totalSeconds) {
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds % 60;
      var mm = minutes < 10 ? '0' + minutes : String(minutes);
      var ss = seconds < 10 ? '0' + seconds : String(seconds);
      return mm + ':' + ss;
    },

    /**
     * Memvalidasi apakah nilai adalah integer antara 1 dan 99 (inklusif).
     * String yang merepresentasikan integer valid juga diterima ("25" → true).
     * Desimal ("1.5"), nol ("0"), dan nilai di luar rentang ditolak.
     * Requirements: 2.9, 2.12
     *
     * @param {string|number} value
     * @returns {boolean} true hanya jika value adalah integer 1–99
     */
    validateDuration: function (value) {
      var num = Number(value);
      // Harus finite, bukan NaN, dan tidak mengandung desimal
      if (!isFinite(num) || Math.floor(num) !== num) {
        return false;
      }
      return num >= 1 && num <= 99;
    },

    /**
     * Mulai hitungan mundur timer.
     * Tidak melakukan apa-apa jika timer sudah berjalan atau sisa waktu = 0.
     * Requirements: 2.3
     */
    start: function () {
      if (this.state.isRunning) return;
      if (this.state.remainingSeconds <= 0) return;
      this.state.isRunning = true;
      var self = this;
      this.state.intervalId = setInterval(function () {
        self.tick();
      }, 1000);
      this.render();
    },

    /**
     * Hentikan hitungan mundur tanpa mereset waktu.
     * Tidak melakukan apa-apa jika timer tidak sedang berjalan.
     * Requirements: 2.4
     */
    stop: function () {
      if (!this.state.isRunning) return;
      this.state.isRunning = false;
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
      this.render();
    },

    /**
     * Hentikan timer dan kembalikan sisa waktu ke durasi yang dikonfigurasi.
     * Requirements: 2.5
     */
    reset: function () {
      this.stop();
      this.state.remainingSeconds = this.state.durationMinutes * 60;
      this.render();
    },

    /**
     * Dekremen remainingSeconds sebesar 1. Dipanggil setiap detik oleh interval.
     * Ketika mencapai 0, memanggil onComplete().
     * Requirements: 2.3, 2.6
     */
    tick: function () {
      if (this.state.remainingSeconds > 0) {
        this.state.remainingSeconds -= 1;
        this.render();
        if (this.state.remainingSeconds === 0) {
          this.onComplete();
        }
      }
    },

    /**
     * Dipanggil saat timer mencapai 00:00.
     * Menghentikan timer, memutar audio notifikasi via Web Audio API,
     * dan menampilkan notifikasi browser jika izin telah diberikan.
     * Requirements: 2.6, 2.7, 2.8
     */
    onComplete: function () {
      this.stop();

      // Putar audio notifikasi menggunakan Web Audio API
      try {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 1);
      } catch (e) {
        // Audio tidak tersedia — abaikan senyap
      }

      // Tampilkan notifikasi browser
      this.showNotification();
    },

    /**
     * Meminta izin notifikasi browser dari pengguna.
     * Hanya meminta jika belum ada keputusan ('default').
     * Requirements: 2.8
     */
    requestNotificationPermission: function () {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },

    /**
     * Menampilkan notifikasi browser bahwa sesi Pomodoro telah selesai.
     * Hanya ditampilkan jika izin sudah diberikan ('granted').
     * Requirements: 2.8
     */
    showNotification: function () {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Sesi Pomodoro Selesai!', {
            body: 'Kerja bagus! Saatnya istirahat.',
            icon: ''
          });
        } catch (e) {
          // Notifikasi gagal — abaikan senyap
        }
      }
    },

    /**
     * Simpan durasi baru (dalam menit) setelah memvalidasinya.
     * Jika valid: perbarui state, simpan ke storage, dan render ulang.
     * Jika tidak valid: tampilkan pesan kesalahan dan tidak simpan.
     * Requirements: 2.9, 2.10, 2.12
     *
     * @param {string|number} minutes  Durasi dalam menit (1–99)
     */
    saveDuration: function (minutes) {
      if (!this.validateDuration(minutes)) {
        // Tampilkan pesan kesalahan
        var errorEl = document.getElementById('timer-error-msg');
        if (errorEl) {
          errorEl.textContent = 'Durasi harus antara 1 sampai 99 menit';
          errorEl.classList.remove('hidden');
        }
        return;
      }
      // Sembunyikan pesan kesalahan
      var errorEl = document.getElementById('timer-error-msg');
      if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
      }
      var mins = Number(minutes);
      this.state.durationMinutes = mins;
      this.state.remainingSeconds = mins * 60;
      StorageManager.save('dashboard_timer_duration', mins);
      this.render();
    },

    /**
     * Perbarui elemen DOM sesuai state timer saat ini.
     * Menampilkan sisa waktu dan menonaktifkan input durasi
     * saat timer sedang berjalan.
     * Requirements: 2.1, 2.13
     */
    render: function () {
      var displayEl = document.getElementById('timer-display');
      if (displayEl) {
        displayEl.textContent = this.formatTime(this.state.remainingSeconds);
      }
      // Nonaktifkan/aktifkan input durasi berdasarkan isRunning (req 2.13)
      var durationInput = document.getElementById('timer-duration-input');
      var saveDurationBtn = document.getElementById('timer-save-duration-btn');
      if (durationInput) {
        durationInput.disabled = this.state.isRunning;
      }
      if (saveDurationBtn) {
        saveDurationBtn.disabled = this.state.isRunning;
      }
    },

    /**
     * Inisialisasi widget: muat durasi dari storage, bind semua event
     * listener, dan render initial state.
     * Requirements: 2.11, 2.3, 2.4, 2.5, 2.9, 2.13
     */
    init: function () {
      // Muat durasi dari storage (default: 25)
      var savedDuration = StorageManager.load('dashboard_timer_duration', 25);
      if (this.validateDuration(savedDuration)) {
        this.state.durationMinutes = savedDuration;
        this.state.remainingSeconds = savedDuration * 60;
      }

      var self = this;

      // Bind tombol Start
      var startBtn = document.getElementById('timer-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', function () {
          self.requestNotificationPermission();
          self.start();
        });
      }

      // Bind tombol Stop
      var stopBtn = document.getElementById('timer-stop-btn');
      if (stopBtn) {
        stopBtn.addEventListener('click', function () {
          self.stop();
        });
      }

      // Bind tombol Reset
      var resetBtn = document.getElementById('timer-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          self.reset();
        });
      }

      // Bind tombol simpan durasi
      var saveDurationBtn = document.getElementById('timer-save-duration-btn');
      if (saveDurationBtn) {
        saveDurationBtn.addEventListener('click', function () {
          var durationInput = document.getElementById('timer-duration-input');
          if (durationInput) {
            self.saveDuration(durationInput.value);
          }
        });
      }

      // Render initial state
      this.render();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // App
  // Entry point aplikasi. Menginisialisasi semua widget setelah
  // DOM siap.
  // ─────────────────────────────────────────────────────────────
  var App = {
    init: function () {
      StorageManager; // tidak perlu init, object literal
      GreetingWidget.init();
      FocusTimerWidget.init();
      TodoWidget.init();
      QuickLinksWidget.init();
    }
  };

  /* istanbul ignore next */
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      App.init();
    });
  }

  // Ekspor untuk keperluan testing (Node.js / Jest environment)
  /* istanbul ignore next */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      StorageManager: StorageManager,
      GreetingWidget: GreetingWidget,
      FocusTimerWidget: FocusTimerWidget,
      TodoWidget: TodoWidget,
      QuickLinksWidget: QuickLinksWidget
    };
  }

})();
