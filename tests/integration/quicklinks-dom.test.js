/**
 * @jest-environment jsdom
 */

'use strict';

/**
 * DOM Integration Tests — QuickLinksWidget rendering
 *
 * Validates:
 *   - Rendered links have target="_blank" (Requirement 4.4)
 *   - Rendered links have rel="noopener noreferrer" (Requirement 4.4)
 *
 * References:
 *   Requirements 4.4
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set up a minimal DOM structure needed by QuickLinksWidget.render().
 * Returns the #links-list element for assertion convenience.
 */
function setupDOM() {
  document.body.innerHTML = `
    <ul id="links-list"></ul>
    <input id="link-label-input" />
    <input id="link-url-input" />
    <button id="link-add-btn">Tambah</button>
  `;
  return document.getElementById('links-list');
}

// ─────────────────────────────────────────────────────────────────────────────
// QuickLinks Rendering Tests
// Validates: Requirement 4.4
// ─────────────────────────────────────────────────────────────────────────────

describe('QuickLinks Rendering', () => {
  let QuickLinksWidget;

  beforeEach(() => {
    // Fresh require so module state is consistent across test runs
    jest.resetModules();
    ({ QuickLinksWidget } = require('../../js/app.js'));

    // Reset widget state and set up DOM
    QuickLinksWidget.state.links = [];
    setupDOM();
  });

  test('rendered links have target="_blank"', () => {
    // Validates: Requirement 4.4
    QuickLinksWidget.state.links = [
      { id: '1', label: 'Google', url: 'https://google.com' },
      { id: '2', label: 'MDN', url: 'https://developer.mozilla.org' }
    ];
    QuickLinksWidget.render();

    const anchors = document.querySelectorAll('#links-list a');
    expect(anchors.length).toBe(2);
    anchors.forEach((a) => {
      expect(a.getAttribute('target')).toBe('_blank');
    });
  });

  test('rendered links have rel="noopener noreferrer"', () => {
    // Validates: Requirement 4.4
    QuickLinksWidget.state.links = [
      { id: '1', label: 'Google', url: 'https://google.com' },
      { id: '2', label: 'MDN', url: 'https://developer.mozilla.org' }
    ];
    QuickLinksWidget.render();

    const anchors = document.querySelectorAll('#links-list a');
    expect(anchors.length).toBe(2);
    anchors.forEach((a) => {
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  test('rendered links have both target="_blank" and rel="noopener noreferrer"', () => {
    // Combined check — ensures both security attributes are present together
    QuickLinksWidget.state.links = [
      { id: '1', label: 'GitHub', url: 'https://github.com' }
    ];
    QuickLinksWidget.render();

    const anchor = document.querySelector('#links-list a');
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('rendered links use the correct href from the link url', () => {
    QuickLinksWidget.state.links = [
      { id: '1', label: 'Example', url: 'https://example.com' }
    ];
    QuickLinksWidget.render();

    const anchor = document.querySelector('#links-list a');
    expect(anchor.getAttribute('href')).toBe('https://example.com');
    expect(anchor.textContent).toBe('Example');
  });

  test('empty links list renders no anchor elements', () => {
    QuickLinksWidget.state.links = [];
    QuickLinksWidget.render();

    const anchors = document.querySelectorAll('#links-list a');
    expect(anchors.length).toBe(0);
  });

  test('addLink then render produces a link with correct security attributes', () => {
    // Validates: Requirement 4.4 via the full add→render pipeline
    QuickLinksWidget.addLink('OpenAI', 'https://openai.com');

    const anchor = document.querySelector('#links-list a');
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
    expect(anchor.getAttribute('href')).toBe('https://openai.com');
    expect(anchor.textContent).toBe('OpenAI');
  });
});
