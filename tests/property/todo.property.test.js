'use strict';

const fc = require('fast-check');

// Test helper - pure version of the logic (mirrors TodoWidget.addTask in app.js)
function makeTask(text) {
  if (!text || text.trim() === '') return null;
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    text: text.trim(),
    completed: false,
    createdAt: Date.now()
  };
}

function addTaskToList(tasks, text) {
  if (!text || text.trim() === '') return tasks;
  const task = makeTask(text);
  return [...tasks, task];
}

// Arbitrary for a single task object (to build task lists)
const taskArb = fc.record({
  id: fc.string({ minLength: 1 }),
  text: fc.string({ minLength: 1 }),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 })
});

/**
 * Property 7: Task Addition Grows List
 * Validates: Requirements 3.1, 3.2
 */
describe('Property 7: Task Addition Grows List', () => {
  it('menambah panjang list tepat 1 untuk teks non-kosong', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        fc.string({ minLength: 1 }),
        (tasks, text) => {
          // Pastikan text tidak hanya whitespace
          fc.pre(text.trim().length > 0);
          const result = addTaskToList(tasks, text);
          return result.length === tasks.length + 1;
        }
      )
    );
  });

  it('task baru memiliki completed === false', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        fc.string({ minLength: 1 }),
        (tasks, text) => {
          fc.pre(text.trim().length > 0);
          const result = addTaskToList(tasks, text);
          const newTask = result[result.length - 1];
          return newTask.completed === false;
        }
      )
    );
  });

  it('task baru memiliki text === text.trim() dari input', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        fc.string({ minLength: 1 }),
        (tasks, text) => {
          fc.pre(text.trim().length > 0);
          const result = addTaskToList(tasks, text);
          const newTask = result[result.length - 1];
          return newTask.text === text.trim();
        }
      )
    );
  });

  it('tidak mengubah panjang list untuk teks kosong atau hanya whitespace', () => {
    // Generate strings that are either empty or only whitespace
    const emptyOrWhitespace = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^\s+$/)
    );
    fc.assert(
      fc.property(
        fc.array(taskArb),
        emptyOrWhitespace,
        (tasks, text) => {
          const result = addTaskToList(tasks, text);
          return result.length === tasks.length;
        }
      )
    );
  });
});

// Pure helper - mirrors editTask logic in TodoWidget (app.js)
function editTaskInList(tasks, id, newText) {
  if (!newText || newText.trim() === '') return tasks;
  return tasks.map(function(task) {
    if (task.id === id) {
      return Object.assign({}, task, { text: newText.trim() });
    }
    return task;
  });
}

/**
 * Property 9: Task Edit Updates Text
 * Validates: Requirements 3.6, 3.7
 */
describe('Property 9: Task Edit Updates Text', () => {
  it('teks task yang di-edit berubah menjadi newText.trim()', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        fc.string({ minLength: 1 }),
        (tasks, newText) => {
          fc.pre(newText.trim().length > 0);
          const target = tasks[0];
          const result = editTaskInList(tasks, target.id, newText);
          const edited = result.find(t => t.id === target.id);
          return edited.text === newText.trim();
        }
      )
    );
  });

  it('id, completed, dan createdAt task yang di-edit tidak berubah', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        fc.string({ minLength: 1 }),
        (tasks, newText) => {
          fc.pre(newText.trim().length > 0);
          const target = tasks[0];
          const result = editTaskInList(tasks, target.id, newText);
          const edited = result.find(t => t.id === target.id);
          return (
            edited.id === target.id &&
            edited.completed === target.completed &&
            edited.createdAt === target.createdAt
          );
        }
      )
    );
  });

  it('task lain dalam list tidak terpengaruh oleh edit', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 2 }),
        fc.string({ minLength: 1 }),
        (tasks, newText) => {
          fc.pre(newText.trim().length > 0);
          const target = tasks[0];
          const result = editTaskInList(tasks, target.id, newText);
          // Semua task selain target harus persis sama
          return tasks.slice(1).every((originalTask, idx) => {
            const resultTask = result[idx + 1];
            return (
              resultTask.id === originalTask.id &&
              resultTask.text === originalTask.text &&
              resultTask.completed === originalTask.completed &&
              resultTask.createdAt === originalTask.createdAt
            );
          });
        }
      )
    );
  });

  it('tidak mengubah list jika newText kosong atau hanya whitespace', () => {
    const emptyOrWhitespace = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^\s+$/)
    );
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        emptyOrWhitespace,
        (tasks, newText) => {
          const target = tasks[0];
          const result = editTaskInList(tasks, target.id, newText);
          // List harus identik (referensi yang sama karena early return)
          return result === tasks;
        }
      )
    );
  });
});

// Pure helper for sort logic (mirrors TodoWidget.getSortedTasks in app.js)
function getSortedTasks(tasks, sortMode) {
  var sorted = tasks.slice(); // copy to avoid mutation
  if (sortMode === 'active-first') {
    sorted.sort(function(a, b) {
      return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    });
  } else if (sortMode === 'done-first') {
    sorted.sort(function(a, b) {
      return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
    });
  } else if (sortMode === 'newest') {
    sorted.sort(function(a, b) { return b.createdAt - a.createdAt; });
  } else if (sortMode === 'oldest') {
    sorted.sort(function(a, b) { return a.createdAt - b.createdAt; });
  }
  return sorted;
}

const sortModeArb = fc.oneof(
  fc.constant('active-first'),
  fc.constant('done-first'),
  fc.constant('newest'),
  fc.constant('oldest')
);

/**
 * Property 12: Sort Preserves Task Count
 * Validates: Requirements 3.11, 3.12, 3.13, 3.14
 */
describe('Property 12: Sort Preserves Task Count', () => {
  it('sorted list memiliki panjang yang sama dengan list asli', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        sortModeArb,
        (tasks, sortMode) => {
          const result = getSortedTasks(tasks, sortMode);
          return result.length === tasks.length;
        }
      )
    );
  });

  it('sorted list mengandung id task yang sama persis (tidak ada task yang hilang atau bertambah)', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        sortModeArb,
        (tasks, sortMode) => {
          const result = getSortedTasks(tasks, sortMode);
          const originalIds = tasks.map(t => t.id).sort();
          const sortedIds = result.map(t => t.id).sort();
          if (originalIds.length !== sortedIds.length) return false;
          return originalIds.every((id, i) => id === sortedIds[i]);
        }
      )
    );
  });
});

// ─── Helpers for Property 11 ────────────────────────────────────────────────

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

function saveTasks(storage, tasks) {
  storage.save('dashboard_todos', tasks);
}

function loadTasks(storage) {
  return storage.load('dashboard_todos', []);
}

function tasksAreEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every(function(taskA, i) {
    const taskB = b[i];
    return taskA.id === taskB.id &&
           taskA.text === taskB.text &&
           taskA.completed === taskB.completed &&
           taskA.createdAt === taskB.createdAt;
  });
}

// Pure mutation helpers (mirror app.js TodoWidget logic)
function applyAddMutation(tasks, text) {
  if (!text || text.trim() === '') return tasks;
  const task = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    text: text.trim(),
    completed: false,
    createdAt: Date.now()
  };
  return [...tasks, task];
}

function applyToggleMutation(tasks, id) {
  return tasks.map(function(t) {
    return t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t;
  });
}

function applyDeleteMutation(tasks, id) {
  return tasks.filter(function(t) { return t.id !== id; });
}

function applyEditMutation(tasks, id, newText) {
  if (!newText || newText.trim() === '') return tasks;
  return tasks.map(function(t) {
    return t.id === id ? Object.assign({}, t, { text: newText.trim() }) : t;
  });
}

/**
 * Property 11: Task Persistence Round-Trip
 * Validates: Requirements 3.9, 3.10
 */
describe('Property 11: Task Persistence Round-Trip', () => {
  it('save+load mengembalikan array yang identik secara struktural untuk sembarang array tasks', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        (tasks) => {
          const storage = createMockStorage();
          saveTasks(storage, tasks);
          const loaded = loadTasks(storage);
          return tasksAreEqual(tasks, loaded);
        }
      )
    );
  });

  it('setelah mutasi add: loaded tasks sama dengan in-memory tasks', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb),
        fc.string({ minLength: 1 }),
        (tasks, text) => {
          fc.pre(text.trim().length > 0);
          const storage = createMockStorage();
          const updated = applyAddMutation(tasks, text);
          saveTasks(storage, updated);
          const loaded = loadTasks(storage);
          return tasksAreEqual(updated, loaded);
        }
      )
    );
  });

  it('setelah mutasi toggle: loaded tasks sama dengan in-memory tasks', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        (tasks) => {
          const storage = createMockStorage();
          const target = tasks[0];
          const updated = applyToggleMutation(tasks, target.id);
          saveTasks(storage, updated);
          const loaded = loadTasks(storage);
          return tasksAreEqual(updated, loaded);
        }
      )
    );
  });

  it('setelah mutasi delete: loaded tasks sama dengan in-memory tasks', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        (tasks) => {
          const storage = createMockStorage();
          const target = tasks[0];
          const updated = applyDeleteMutation(tasks, target.id);
          saveTasks(storage, updated);
          const loaded = loadTasks(storage);
          return tasksAreEqual(updated, loaded);
        }
      )
    );
  });

  it('setelah mutasi edit: loaded tasks sama dengan in-memory tasks', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        fc.string({ minLength: 1 }),
        (tasks, newText) => {
          fc.pre(newText.trim().length > 0);
          const storage = createMockStorage();
          const target = tasks[0];
          const updated = applyEditMutation(tasks, target.id, newText);
          saveTasks(storage, updated);
          const loaded = loadTasks(storage);
          return tasksAreEqual(updated, loaded);
        }
      )
    );
  });
});
