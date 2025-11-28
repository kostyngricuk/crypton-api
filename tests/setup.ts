// Jest setup file for domain whitelist security enhancement tests
import { jest } from '@jest/globals';

// Extend Jest matchers if needed
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeLocalhostAddress(): R;
    }
  }
}

// Setup global test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.ALLOWED_DOMAINS = 'localhost,127.0.0.1';
  process.env.BEARER_TOKENS = 'test-token-123,test-token-456'; // Add test tokens for Bearer auth
  // Ensure anti-spoofing logic uses X-Forwarded-For in tests
  process.env.TRUST_PROXY = "true";
});

// Clean up after tests
afterEach(() => {
  jest.clearAllMocks();
});