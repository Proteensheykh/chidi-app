// Import Jest DOM testing utilities
import '@testing-library/jest-dom';

// Setup Jest's fake timers
jest.useFakeTimers();

// Ensure all required timer functions are available
// This is a much simpler approach that avoids TypeScript errors
const noop = () => {};

// Only define these if they don't already exist
if (!global.setTimeout) {
  // @ts-ignore - We're deliberately using a simplified version
  global.setTimeout = noop;
}

if (!global.clearTimeout) {
  // @ts-ignore - We're deliberately using a simplified version
  global.clearTimeout = noop;
}

if (!global.setInterval) {
  // @ts-ignore - We're deliberately using a simplified version
  global.setInterval = noop;
}

if (!global.clearInterval) {
  // @ts-ignore - We're deliberately using a simplified version
  global.clearInterval = noop;
}

if (!global.requestAnimationFrame) {
  // @ts-ignore - We're deliberately using a simplified version
  global.requestAnimationFrame = () => 0;
}

if (!global.cancelAnimationFrame) {
  // @ts-ignore - We're deliberately using a simplified version
  global.cancelAnimationFrame = noop;
}

// Use legacy fake timers for better compatibility
jest.useFakeTimers({
  legacyFakeTimers: true
});

// Make testing-library detect our timer functions as mocks
// This is needed for waitFor and other async utilities
if (global.setTimeout) {
  // @ts-ignore - Adding Jest's _isMockFunction property
  global.setTimeout._isMockFunction = true;
}

if (global.clearTimeout) {
  // @ts-ignore - Adding Jest's _isMockFunction property
  global.clearTimeout._isMockFunction = true;
}

if (global.setInterval) {
  // @ts-ignore - Adding Jest's _isMockFunction property
  global.setInterval._isMockFunction = true;
}

if (global.clearInterval) {
  // @ts-ignore - Adding Jest's _isMockFunction property
  global.clearInterval._isMockFunction = true;
}

// Mock next/navigation for Next.js tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}));

// Mock next/router for Next.js tests (for older Next.js APIs)
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
}));

// Increase Jest timeout for all tests
jest.setTimeout(10000);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));

// Add ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Add IntersectionObserver polyfill
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock HTMLElement methods
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});
