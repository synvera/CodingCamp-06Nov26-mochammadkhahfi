'use strict';

/**
 * Integration Unit Tests — To-Do Life Dashboard
 *
 * Validates:
 *   - Initial state of all widgets (Requirements 1.8, 2.2)
 *   - Timer state machine transitions (Requirements 2.2, 2.3, 2.4, 2.6)
 *
 * These tests exercise pure state logic and do not require a DOM.
 * For DOM rendering tests (QuickLinks target="_blank"), see:
 *   tests/integration/quicklinks-dom.test.js
 *
 * References:
 *   Requirements 2.2, 2.3, 2.4, 2.6, 1.8
 */

// ─────────────────────────────────────────────────────────────────────────────
// Module import
// ─────────────────────────────────────────────────────────────────────────────

const {
  FocusTimerWidget,
  GreetingWidget,
  TodoWidget,
  QuickLinksWidget
} = require('../../js/app.js');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Initial State Tests
// Validates: Requirements 1.8 (GreetingWidget default), 2.2 (timer IDLE state)
// ─────────────────────────────────────────────────────────────────────────────

describe('Initial State', () => {
  test('FocusTimerWidget default state should be 25 minutes (1500 seconds)', () => {
    // Validates: Requirement 2.2
    expect(FocusTimerWidget.state.durationMinutes).toBe(25);
    expect(FocusTimerWidget.state.remainingSeconds).toBe(1500);
    expect(FocusTimerWidget.state.isRunning).toBe(false);
    expect(FocusTimerWidget.formatTime(FocusTimerWidget.state.remainingSeconds)).toBe('25:00');
  });

  test('GreetingWidget default username should be "Pengguna"', () => {
    // Validates: Requirement 1.8
    expect(GreetingWidget.state.userName).toBe('Pengguna');
  });

  test('TodoWidget default state should have empty tasks array', () => {
    expect(TodoWidget.state.tasks).toEqual([]);
  });

  test('QuickLinksWidget default state should have empty links array', () => {
    expect(QuickLinksWidget.state.links).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Timer State Machine Tests
// Validates: Requirements 2.2 (IDLE), 2.3 (start/RUNNING), 2.4 (stop/PAUSED),
//            2.6 (tick to COMPLETED)
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer State Machine', () => {
  // Reset timer state before each test to ensure isolation
  beforeEach(() => {
    // Stop any running interval from previous tests
    if (FocusTimerWidget.state.isRunning) {
      clearInterval(FocusTimerWidget.state.intervalId);
    }
    FocusTimerWidget.state.durationMinutes = 25;
    FocusTimerWidget.state.remainingSeconds = 1500;
    FocusTimerWidget.state.isRunning = false;
    FocusTimerWidget.state.intervalId = null;
  });

  afterEach(() => {
    // Clean up any lingering intervals
    if (FocusTimerWidget.state.intervalId !== null) {
      clearInterval(FocusTimerWidget.state.intervalId);
      FocusTimerWidget.state.intervalId = null;
    }
    FocusTimerWidget.state.isRunning = false;
  });

  // ── IDLE state ─────────────────────────────────────────────────────────────

  test('IDLE state: isRunning=false, remainingSeconds equals durationMinutes*60', () => {
    // Validates: Requirement 2.2
    expect(FocusTimerWidget.state.isRunning).toBe(false);
    expect(FocusTimerWidget.state.remainingSeconds).toBe(
      FocusTimerWidget.state.durationMinutes * 60
    );
  });

  // ── formatTime pure logic ──────────────────────────────────────────────────

  test('formatTime renders "25:00" for default 1500 seconds', () => {
    expect(FocusTimerWidget.formatTime(1500)).toBe('25:00');
  });

  test('formatTime renders "00:00" for 0 seconds', () => {
    expect(FocusTimerWidget.formatTime(0)).toBe('00:00');
  });

  test('formatTime renders "01:30" for 90 seconds', () => {
    expect(FocusTimerWidget.formatTime(90)).toBe('01:30');
  });

  // ── validateDuration ───────────────────────────────────────────────────────

  test('validateDuration returns true only for integers 1–99', () => {
    expect(FocusTimerWidget.validateDuration(1)).toBe(true);
    expect(FocusTimerWidget.validateDuration(25)).toBe(true);
    expect(FocusTimerWidget.validateDuration(99)).toBe(true);
    expect(FocusTimerWidget.validateDuration(0)).toBe(false);
    expect(FocusTimerWidget.validateDuration(100)).toBe(false);
    expect(FocusTimerWidget.validateDuration(1.5)).toBe(false);
    expect(FocusTimerWidget.validateDuration(-1)).toBe(false);
  });

  // ── IDLE → RUNNING (start) ─────────────────────────────────────────────────

  test('IDLE → RUNNING: start() sets isRunning=true and does not change remainingSeconds', () => {
    // Validates: Requirement 2.3
    // Override render to avoid DOM access
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.start();

    expect(FocusTimerWidget.state.isRunning).toBe(true);
    expect(FocusTimerWidget.state.remainingSeconds).toBe(1500);

    FocusTimerWidget.render = origRender;
  });

  test('start() is idempotent: calling it twice does not change state', () => {
    // Validates: Requirement 2.3 — "tidak melakukan apa-apa jika timer sudah berjalan"
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.start();
    const intervalAfterFirst = FocusTimerWidget.state.intervalId;
    FocusTimerWidget.start(); // second call — should be a no-op

    expect(FocusTimerWidget.state.isRunning).toBe(true);
    expect(FocusTimerWidget.state.intervalId).toBe(intervalAfterFirst);

    FocusTimerWidget.render = origRender;
  });

  // ── RUNNING → PAUSED (stop) ────────────────────────────────────────────────

  test('RUNNING → PAUSED: stop() sets isRunning=false and preserves remainingSeconds', () => {
    // Validates: Requirement 2.4
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.start();
    expect(FocusTimerWidget.state.isRunning).toBe(true);

    FocusTimerWidget.stop();
    expect(FocusTimerWidget.state.isRunning).toBe(false);
    // Remaining time must not be reset to full duration on a mere stop
    expect(FocusTimerWidget.state.remainingSeconds).toBe(1500);
    expect(FocusTimerWidget.state.intervalId).toBeNull();

    FocusTimerWidget.render = origRender;
  });

  test('stop() is a no-op when already stopped', () => {
    // Validates: Requirement 2.4 — "tidak melakukan apa-apa jika timer tidak sedang berjalan"
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    // Timer is already stopped (beforeEach guarantees this)
    expect(FocusTimerWidget.state.isRunning).toBe(false);
    FocusTimerWidget.stop(); // should not throw or change state
    expect(FocusTimerWidget.state.isRunning).toBe(false);

    FocusTimerWidget.render = origRender;
  });

  // ── PAUSED → RUNNING (resume via start) ───────────────────────────────────

  test('PAUSED → RUNNING: start() after stop() resumes from same remainingSeconds', () => {
    // Validates: Requirements 2.3, 2.4
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.start();
    FocusTimerWidget.stop();
    const secondsWhenPaused = FocusTimerWidget.state.remainingSeconds;

    FocusTimerWidget.start();
    expect(FocusTimerWidget.state.isRunning).toBe(true);
    expect(FocusTimerWidget.state.remainingSeconds).toBe(secondsWhenPaused);

    FocusTimerWidget.render = origRender;
  });

  // ── tick() countdown ──────────────────────────────────────────────────────

  test('tick() decrements remainingSeconds by 1', () => {
    // Validates: Requirement 2.6
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.state.remainingSeconds = 10;
    FocusTimerWidget.tick();
    expect(FocusTimerWidget.state.remainingSeconds).toBe(9);

    FocusTimerWidget.render = origRender;
  });

  // ── RUNNING → COMPLETED (tick to 0) ───────────────────────────────────────

  test('COMPLETED: timer stops automatically when remainingSeconds reaches 0', () => {
    // Validates: Requirement 2.6
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    // Stub onComplete to avoid Web Audio / Notification API calls in Node
    const origOnComplete = FocusTimerWidget.onComplete;
    const completedCalls = [];
    FocusTimerWidget.onComplete = function () {
      completedCalls.push(true);
      // Call the real stop() logic without audio/notifications
      if (FocusTimerWidget.state.isRunning) {
        clearInterval(FocusTimerWidget.state.intervalId);
        FocusTimerWidget.state.isRunning = false;
        FocusTimerWidget.state.intervalId = null;
      }
    };

    FocusTimerWidget.state.remainingSeconds = 1;
    FocusTimerWidget.state.isRunning = true; // simulate running state

    FocusTimerWidget.tick(); // remainingSeconds → 0 → triggers onComplete

    expect(FocusTimerWidget.state.remainingSeconds).toBe(0);
    expect(completedCalls).toHaveLength(1);
    expect(FocusTimerWidget.state.isRunning).toBe(false);

    FocusTimerWidget.onComplete = origOnComplete;
    FocusTimerWidget.render = origRender;
  });

  // ── reset() ────────────────────────────────────────────────────────────────

  test('reset() restores remainingSeconds to durationMinutes*60 and stops timer', () => {
    // Validates: Requirement 2.5
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.start();
    FocusTimerWidget.state.remainingSeconds = 500; // simulate countdown mid-way
    FocusTimerWidget.reset();

    expect(FocusTimerWidget.state.isRunning).toBe(false);
    expect(FocusTimerWidget.state.remainingSeconds).toBe(
      FocusTimerWidget.state.durationMinutes * 60
    );

    FocusTimerWidget.render = origRender;
  });

  test('start() does nothing when remainingSeconds is 0', () => {
    // Edge case for completed state — timer should not restart
    const origRender = FocusTimerWidget.render;
    FocusTimerWidget.render = () => {};

    FocusTimerWidget.state.remainingSeconds = 0;
    FocusTimerWidget.start();

    expect(FocusTimerWidget.state.isRunning).toBe(false);
    expect(FocusTimerWidget.state.intervalId).toBeNull();

    FocusTimerWidget.render = origRender;
  });
});
