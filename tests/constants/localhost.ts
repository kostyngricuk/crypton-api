/**
 * Test constants for localhost address variants and validation
 * Used across domain whitelist security tests
 */

/**
 * All valid IPv4 localhost addresses that should be allowed
 */
export const VALID_IPV4_LOCALHOST_ADDRESSES = [
  '127.0.0.1',
  '127.0.0.2',
  '127.0.0.255',
  '127.1.0.1',
  '127.255.255.255',
] as const;

/**
 * All valid IPv6 localhost addresses that should be allowed
 */
export const VALID_IPV6_LOCALHOST_ADDRESSES = [
  '::1',
  '::ffff:127.0.0.1',
  '::ffff:127.0.0.2',
  '0000:0000:0000:0000:0000:0000:0000:0001',
] as const;

/**
 * Valid localhost hostname variants
 */
export const VALID_LOCALHOST_HOSTNAMES = [
  'localhost',
  'LOCALHOST',
  'Localhost',
] as const;

/**
 * All valid localhost addresses (combined)
 */
export const ALL_VALID_LOCALHOST_ADDRESSES = [
  ...VALID_IPV4_LOCALHOST_ADDRESSES,
  ...VALID_IPV6_LOCALHOST_ADDRESSES,
] as const;

/**
 * External IP addresses that should be blocked
 */
export const EXTERNAL_IP_ADDRESSES = [
  '8.8.8.8',
  '1.1.1.1',
  '192.168.1.100',
  '10.0.0.1',
  '172.16.0.1',
  '203.0.113.1',
  '2001:db8::1',
  '2001:4860:4860::8888',
] as const;

/**
 * Invalid IP address formats for edge case testing
 */
export const INVALID_IP_ADDRESSES = [
  '256.256.256.256',
  '127.0.0',
  '127.0.0.0.1',
  'not-an-ip',
  '',
  '::g',
  '2001:db8:::1',
] as const;

/**
 * Valid external domains that should be blocked
 */
export const EXTERNAL_DOMAINS = [
  'https://google.com',
  'https://malicious-site.com',
  'http://external-api.com',
  'https://example.org',
  'http://test-domain.net',
] as const;

/**
 * Localhost origin patterns that should be allowed
 */
export const LOCALHOST_ORIGIN_PATTERNS = [
  'http://localhost',
  'https://localhost',
  'http://localhost:3000',
  'https://localhost:8080',
  'http://127.0.0.1',
  'https://127.0.0.1:3000',
] as const;

/**
 * Error message constants for consistent testing
 */
export const ERROR_MESSAGES = {
  DOMAIN_NOT_ALLOWED: 'Domain not allowed',
  INVALID_ORIGIN: 'Invalid origin',
  ACCESS_DENIED: 'Access denied',
  NO_ORIGIN_EXTERNAL_IP: 'Access denied - no origin header and not from localhost',
} as const;

/**
 * HTTP status codes used in testing
 */
export const HTTP_STATUS_CODES = {
  OK: 200,
  FORBIDDEN: 403,
} as const;

/**
 * Test environment configuration
 */
export const TEST_CONFIG = {
  DEFAULT_ALLOWED_DOMAINS: 'localhost,127.0.0.1',
  TEST_TIMEOUT: 5000,
  MAX_ORIGIN_LENGTH: 2000,
} as const;

/**
 * Proxy header names for testing
 */
export const PROXY_HEADERS = {
  X_FORWARDED_FOR: 'x-forwarded-for',
  X_REAL_IP: 'x-real-ip',
  X_CLIENT_IP: 'x-client-ip',
  CF_CONNECTING_IP: 'cf-connecting-ip',
} as const;