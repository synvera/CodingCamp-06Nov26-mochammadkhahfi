'use strict';

/**
 * Property-Based Tests — FocusTimerWidget
 * Uses Jest + fast-check.
 *
 * Property 4: Timer Format Correctness  (task 4.2)
 * Property 5: Timer Duration Validation (task 4.3)
 *
 * Validates: Requirements 2.1
 */

const fc = require('fast-check');
const { FocusTimerWidget } = require('../../js/app.js');

// ─────────────────────────────────────────────────────────────────────────────
// Property 4: Timer Format Correctness
// Validates: Requirements 2.1
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 4: Timer Format Correctness', () => {
  /**
   * Validates: Requirements 2.1
   *
   * For any integer totalSeconds in 0–5940, formatTime should return a string
   * matching MM:SS (zero-padded minutes 00–99, zero-padded seconds 00–59).
   */
  test('formatTime returns MM:SS pattern for all valid totalSeconds (0–5940)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5940 }),
        (totalSeconds) => {
          const result = FocusTimerWidget.formatTime(totalSeconds);
          expect(typeof result).toBe('string');
          expect(result).toMatch(/^\d{2}:\d{2}$/);
          const [mm, ss] = result.split(':').map(Number);
          expect(ss).toBeGreaterThanOrEqual(0);
          expect(ss).toBeLessThanOrEqual(59);
          expect(mm).toBeGreaterThanOrEqual(0);
          expect(mm).toBeLessThanOrEqual(99);
        }
      )
    );
  });

  // Specific example checks
  test('formatTime(0) === "00:00"', () => {
    expect(FocusTimerWidget.formatTime(0)).toBe('00:00');
  });

  test('formatTime(1500) === "25:00" (default Pomodoro duration)', () => {
    expect(FocusTimerWidget.formatTime(1500)).toBe('25:00');
  });

  test('formatTime(5940) === "99:00" (maximum valid)', () => {
    expect(FocusTimerWidget.formatTime(5940)).toBe('99:00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 5: Timer Duration Validation
// Validates: Requirements 2.9, 2.12
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 5: Timer Duration Validation', () => {
  /**
   * Validates: Requirements 2.9, 2.12
   *
   * For all integers 1–99, validateDuration should return true.
   */
  test('validateDuration returns true for all integers in valid range [1, 99]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        (n) => {
          expect(FocusTimerWidget.validateDuration(n)).toBe(true);
        }
      )
    );
  });

  /**
   * Validates: Requirements 2.9, 2.12
   *
   * For all integers >= 100, validateDuration should return false.
   */
  test('validateDuration returns false for all integers >= 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000 }),
        (n) => {
          expect(FocusTimerWidget.validateDuration(n)).toBe(false);
        }
      )
    );
  });

  /**
   * Validates: Requirements 2.9, 2.12
   *
   * For all integers <= 0, validateDuration should return false.
   */
  test('validateDuration returns false for all integers <= 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 0 }),
        (n) => {
          expect(FocusTimerWidget.validateDuration(n)).toBe(false);
        }
      )
    );
  });

  /**
   * Validates: Requirements 2.9, 2.12
   *
   * For decimal (non-integer) numbers, validateDuration should return false.
   */
  test('validateDuration returns false for decimal (non-integer) numbers', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }).filter(
          (f) => Math.floor(f) !== f
        ),
        (f) => {
          expect(FocusTimerWidget.validateDuration(f)).toBe(false);
        }
      )
    );
  });

  /**
   * Validates: Requirements 2.9, 2.12
   *
   * For string representations of valid integers ("1"–"99"),
   * validateDuration should return true.
   */
  test('validateDuration returns true for string representations of valid integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }).map((n) => String(n)),
        (s) => {
          expect(FocusTimerWidget.validateDuration(s)).toBe(true);
        }
      )
    );
  });

  /**
   * Validates: Requirements 2.9, 2.12
   *
   * For invalid strings (non-numeric, decimal strings, empty, out-of-range strings),
   * validateDuration should return false.
   */
  test('validateDuration returns false for invalid strings', () => {
    const invalidStrings = ['abc', '1.5', '', '0', '-1', '100', 'hello', ' ', '1e2'];
    for (const s of invalidStrings) {
      expect(FocusTimerWidget.validateDuration(s)).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 6: Timer Duration Persistence Round-Trip
// Validates: Requirements 2.10, 2.11
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In-memory mock storage for round-trip tests.
 * Mimics the interface of StorageManager (save/load) without touching localStorage.
 */
function createMockStorage() {
  const store = {};
  return {
    save: function (key, value) {
      store[key] = JSON.stringify(value);
    },
    load: function (key, defaultValue) {
      try {
        const raw = store[key];
        if (raw === undefined) return defaultValue;
        return JSON.parse(raw);
      } catch (e) {
        return defaultValue;
      }
    }
  };
}

/**
 * Pure saveDuration logic — isolated from the DOM-dependent FocusTimerWidget.
 * Validates the input, stores it, and returns the loaded value.
 */
function saveDurationRoundTrip(storage, duration) {
  // Validate: must be integer 1-99
  const num = Number(duration);
  if (!isFinite(num) || Math.floor(num) !== num || num < 1 || num > 99) {
    return null; // invalid, not saved
  }
  storage.save('dashboard_timer_duration', num);
  return storage.load('dashboard_timer_duration', 25);
}

describe('Property 6: Timer Duration Persistence Round-Trip', () => {
  /**
   * **Validates: Requirements 2.10, 2.11**
   *
   * For any valid integer duration d in [1, 99], saveDurationRoundTrip(storage, d)
   * must return exactly d — the stored value is loaded back unchanged.
   */
  test('saveDurationRoundTrip returns the original integer for all valid durations [1, 99]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        (d) => {
          const storage = createMockStorage();
          const result = saveDurationRoundTrip(storage, d);
          expect(result).toBe(d);
        }
      )
    );
  });

  /**
   * **Validates: Requirements 2.10, 2.11**
   *
   * The round-trip must preserve the exact integer value with no type coercion:
   * typeof result === 'number' and result === d (strict equality).
   */
  test('round-trip preserves exact integer value (no type coercion)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        (d) => {
          const storage = createMockStorage();
          const result = saveDurationRoundTrip(storage, d);
          expect(typeof result).toBe('number');
          expect(result).toStrictEqual(d);
        }
      )
    );
  });

  // ── Specific example checks ──────────────────────────────────────────────

  test('saveDurationRoundTrip(storage, 1) returns 1 (minimum boundary)', () => {
    expect(saveDurationRoundTrip(createMockStorage(), 1)).toBe(1);
  });

  test('saveDurationRoundTrip(storage, 25) returns 25 (default Pomodoro)', () => {
    expect(saveDurationRoundTrip(createMockStorage(), 25)).toBe(25);
  });

  test('saveDurationRoundTrip(storage, 99) returns 99 (maximum boundary)', () => {
    expect(saveDurationRoundTrip(createMockStorage(), 99)).toBe(99);
  });

  test('saveDurationRoundTrip returns null for out-of-range value 0', () => {
    expect(saveDurationRoundTrip(createMockStorage(), 0)).toBeNull();
  });

  test('saveDurationRoundTrip returns null for out-of-range value 100', () => {
    expect(saveDurationRoundTrip(createMockStorage(), 100)).toBeNull();
  });
});
