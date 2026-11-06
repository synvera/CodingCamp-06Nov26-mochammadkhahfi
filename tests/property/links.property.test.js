'use strict';

/**
 * Property tests for Quick Links functionality.
 * Validates: Requirements 4.6, 4.7
 */

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Mock storage (in-memory, no real localStorage required)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Pure helpers mirroring QuickLinksWidget logic
// ---------------------------------------------------------------------------
function addLink(links, label, url) {
  if (!label || label.trim() === '' || !url || url.trim() === '') return links;
  return [...links, { id: Date.now().toString(), label: label.trim(), url: url.trim() }];
}

function deleteLink(links, id) {
  return links.filter(function(link) { return link.id !== id; });
}

function saveLinks(storage, links) {
  storage.save('dashboard_links', links);
}

function loadLinks(storage) {
  return storage.load('dashboard_links', []);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// A single link object with non-empty id, label, url
const linkArb = fc.record({
  id: fc.string({ minLength: 1 }),
  label: fc.string({ minLength: 1 }),
  url: fc.string({ minLength: 1 })
});

// An array of links
const linksArrayArb = fc.array(linkArb);

// Non-empty, non-whitespace strings for add operations
const nonEmptyStringArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

// ---------------------------------------------------------------------------
// Helper: deep-structural equality for link arrays
// ---------------------------------------------------------------------------
function linksAreEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every(function(linkA, i) {
    const linkB = b[i];
    return linkA.id === linkB.id && linkA.label === linkB.label && linkA.url === linkB.url;
  });
}

/**
 * Property 19: Link Persistence Round-Trip
 * Validates: Requirements 4.6, 4.7
 *
 * For any sequence of mutations (add, delete), save() then load('dashboard_links')
 * must return an array that is structurally identical to the in-memory `links`.
 */
describe('Property 19: Link Persistence Round-Trip', () => {

  it('19.1 save+load identity: setiap links array dikembalikan identik setelah round-trip', () => {
    fc.assert(
      fc.property(
        linksArrayArb,
        function(links) {
          const storage = createMockStorage();
          saveLinks(storage, links);
          const loaded = loadLinks(storage);
          return linksAreEqual(links, loaded);
        }
      )
    );
  });

  it('19.2 add mutation: setelah addLink + save + load, loaded links identik dengan in-memory links', () => {
    fc.assert(
      fc.property(
        linksArrayArb,
        nonEmptyStringArb,
        nonEmptyStringArb,
        function(initialLinks, label, url) {
          const storage = createMockStorage();
          const inMemory = addLink(initialLinks, label, url);
          saveLinks(storage, inMemory);
          const loaded = loadLinks(storage);
          return linksAreEqual(inMemory, loaded);
        }
      )
    );
  });

  it('19.3 delete mutation: setelah deleteLink + save + load, loaded links identik dengan in-memory links', () => {
    fc.assert(
      fc.property(
        fc.array(linkArb, { minLength: 1 }),
        function(initialLinks) {
          const storage = createMockStorage();
          // Delete the first link
          const targetId = initialLinks[0].id;
          const inMemory = deleteLink(initialLinks, targetId);
          saveLinks(storage, inMemory);
          const loaded = loadLinks(storage);
          return linksAreEqual(inMemory, loaded);
        }
      )
    );
  });

  it('19.4 empty array round-trip: load dari storage kosong mengembalikan default array kosong', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // dummy to satisfy fc.property signature
        function(_) {
          const storage = createMockStorage();
          const loaded = loadLinks(storage);
          return Array.isArray(loaded) && loaded.length === 0;
        }
      )
    );
  });

  it('19.5 multiple mutations: urutan add lalu delete menghasilkan round-trip yang identik', () => {
    fc.assert(
      fc.property(
        linksArrayArb,
        nonEmptyStringArb,
        nonEmptyStringArb,
        function(initialLinks, label, url) {
          const storage = createMockStorage();

          // Step 1: add a link
          const afterAdd = addLink(initialLinks, label, url);

          // Step 2: delete the newly added link (last element)
          const newLink = afterAdd[afterAdd.length - 1];
          const inMemory = deleteLink(afterAdd, newLink.id);

          saveLinks(storage, inMemory);
          const loaded = loadLinks(storage);

          // After add + delete, in-memory should match original links
          return linksAreEqual(inMemory, loaded);
        }
      )
    );
  });
});
