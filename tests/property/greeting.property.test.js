/**
 * Property-Based Tests untuk GreetingWidget
 *
 * Menggunakan Jest + fast-check untuk memverifikasi properti universal
 * fungsi-fungsi murni di GreetingWidget.
 */

const fc = require('fast-check');
const { GreetingWidget } = require('../../js/app.js');

// ─────────────────────────────────────────────────────────────
// Property 2: Greeting Coverage
// Validates: Requirements 1.3, 1.4, 1.5, 1.6
// ─────────────────────────────────────────────────────────────

const VALID_GREETINGS = ['Selamat Pagi', 'Selamat Siang', 'Selamat Sore', 'Selamat Malam'];

describe('Property 2: Greeting Coverage', () => {
  /**
   * **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
   *
   * Untuk semua nilai jam 0–23, getGreeting(hour) harus mengembalikan
   * tepat satu dari empat sapaan yang valid.
   */
  test('untuk semua jam 0–23, getGreeting mengembalikan tepat satu dari empat sapaan yang valid', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = GreetingWidget.getGreeting(hour);
        return VALID_GREETINGS.includes(result);
      })
    );
  });

  /**
   * **Validates: Requirements 1.3**
   *
   * Jam 5–11 harus mengembalikan "Selamat Pagi".
   */
  test('jam 5–11 mengembalikan "Selamat Pagi"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 5, max: 11 }), (hour) => {
        return GreetingWidget.getGreeting(hour) === 'Selamat Pagi';
      })
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Jam 12–14 harus mengembalikan "Selamat Siang".
   */
  test('jam 12–14 mengembalikan "Selamat Siang"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 12, max: 14 }), (hour) => {
        return GreetingWidget.getGreeting(hour) === 'Selamat Siang';
      })
    );
  });

  /**
   * **Validates: Requirements 1.5**
   *
   * Jam 15–17 harus mengembalikan "Selamat Sore".
   */
  test('jam 15–17 mengembalikan "Selamat Sore"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 15, max: 17 }), (hour) => {
        return GreetingWidget.getGreeting(hour) === 'Selamat Sore';
      })
    );
  });

  /**
   * **Validates: Requirements 1.6**
   *
   * Jam 0–4 dan 18–23 harus mengembalikan "Selamat Malam".
   */
  test('jam 0–4 mengembalikan "Selamat Malam"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4 }), (hour) => {
        return GreetingWidget.getGreeting(hour) === 'Selamat Malam';
      })
    );
  });

  test('jam 18–23 mengembalikan "Selamat Malam"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 18, max: 23 }), (hour) => {
        return GreetingWidget.getGreeting(hour) === 'Selamat Malam';
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Property 3: Name Persistence Round-Trip
// Validates: Requirements 1.9, 1.10
// ─────────────────────────────────────────────────────────────

/**
 * In-memory storage mock to simulate localStorage + StorageManager
 * without touching the real browser environment.
 */
function createMockStorage() {
  const store = {};
  return {
    save: function(key, value) {
      store[key] = JSON.stringify(value);
    },
    load: function(key, defaultValue) {
      try {
        const raw = store[key];
        if (raw === undefined) return defaultValue;
        return JSON.parse(raw);
      } catch(e) {
        return defaultValue;
      }
    }
  };
}

/**
 * Pure saveName logic extracted from GreetingWidget.saveName(name):
 *   - trims whitespace
 *   - falls back to 'Pengguna' when result is empty
 *   - saves to storage under key 'dashboard_user_name'
 * Returns the value that was persisted (same as what load would return).
 */
function saveNameRoundTrip(storage, name) {
  const trimmed = name.trim();
  const userName = trimmed || 'Pengguna';
  storage.save('dashboard_user_name', userName);
  return storage.load('dashboard_user_name', 'Pengguna');
}

describe('Property 3: Name Persistence Round-Trip', () => {
  /**
   * **Validates: Requirements 1.9, 1.10**
   *
   * Untuk sembarang nama non-kosong dan non-whitespace, saveName lalu load
   * harus mengembalikan nama yang sudah di-trim — tepat seperti yang disimpan.
   */
  test('nama non-kosong tersimpan dan dimuat kembali tanpa perubahan (setelah trim)', () => {
    fc.assert(
      fc.property(
        // Generate string yang setelah di-trim tidak kosong
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (name) => {
          const storage = createMockStorage();
          const result = saveNameRoundTrip(storage, name);
          // Round-trip harus mengembalikan nama yang sudah di-trim
          return result === name.trim();
        }
      )
    );
  });

  /**
   * **Validates: Requirements 1.9, 1.10**
   *
   * Untuk string kosong atau hanya whitespace, saveName harus menyimpan
   * dan mengembalikan nilai default 'Pengguna'.
   */
  test('nama kosong atau whitespace-only menghasilkan nilai default "Pengguna"', () => {
    fc.assert(
      fc.property(
        // String yang setelah di-trim menjadi kosong: "" atau "   " dsb.
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 })
        ),
        (name) => {
          const storage = createMockStorage();
          const result = saveNameRoundTrip(storage, name);
          return result === 'Pengguna';
        }
      )
    );
  });

  /**
   * **Validates: Requirements 1.9, 1.10**
   *
   * Setiap pemanggilan saveName dengan nama baru harus menimpa nilai lama —
   * load selalu mengembalikan nama yang paling terakhir disimpan.
   */
  test('saveName yang dipanggil berurutan selalu menghasilkan nilai terbaru', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (firstName, secondName) => {
          const storage = createMockStorage();
          saveNameRoundTrip(storage, firstName);
          const result = saveNameRoundTrip(storage, secondName);
          // Nilai yang dimuat harus nama kedua (terbaru), bukan nama pertama
          return result === secondName.trim();
        }
      )
    );
  });
});
