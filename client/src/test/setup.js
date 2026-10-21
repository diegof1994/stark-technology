import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Setup global de las pruebas del frontend.
 * Limpia el DOM y el localStorage entre cada test.
 */

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

// jsdom no implementa scrollIntoView (lo usan los componentes con motion).
window.HTMLElement.prototype.scrollIntoView = () => {};

// jsdom no implementa matchMedia (lo usa ThemeContext).
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

// jsdom no implementa IntersectionObserver (lo usa `whileInView` de Motion).
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Se dispara de inmediato para simular un elemento visible.
    this.callback([{ isIntersecting: true, intersectionRatio: 1 }], this);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver = MockIntersectionObserver;
globalThis.IntersectionObserver = MockIntersectionObserver;

// jsdom no implementa ResizeObserver (lo usa Motion).
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;
globalThis.ResizeObserver = MockResizeObserver;
