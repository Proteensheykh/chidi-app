import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/public/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/public/',
  ],
  // Configure test environment options for better compatibility
  testEnvironmentOptions: {
    customExportConditions: [''],
    url: 'http://localhost/',
    resources: 'usable',
    runScripts: 'dangerously',
  },
  // Configure fake timers to be more compatible with Node.js v22
  fakeTimers: {
    enableGlobally: true,
    // Use modern timers for better compatibility with Node.js v22
    legacyFakeTimers: false,
  },
  // Increase test timeout for potentially slow tests
  testTimeout: 15000,
  // Configure test runner to handle timer issues
  testRunner: 'jest-circus/runner',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
