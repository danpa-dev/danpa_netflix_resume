import '@testing-library/jest-dom';
import 'intersection-observer';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Provide missing browser APIs for jsdom
if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.assign(globalThis, { ResizeObserver: ResizeObserverStub });
}
