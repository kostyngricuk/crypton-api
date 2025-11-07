/**
 * Test fixtures for request scenarios used in domain whitelist testing
 * Contains various IP addresses and header combinations for comprehensive testing
 */

import type { MockRequestOptions } from '../utils/mockExpress.js';

/**
 * Valid localhost request scenarios that should be allowed
 */
export const localhostRequestScenarios: Array<{
  name: string;
  description: string;
  requestOptions: MockRequestOptions;
}> = [
  {
    name: 'IPv4 localhost',
    description: 'Standard IPv4 localhost address',
    requestOptions: {
      ip: '127.0.0.1',
      origin: undefined,
    },
  },
  {
    name: 'IPv6 localhost',
    description: 'Standard IPv6 localhost address',
    requestOptions: {
      ip: '::1',
      origin: undefined,
    },
  },
  {
    name: 'IPv4-mapped IPv6 localhost',
    description: 'IPv4 address mapped to IPv6 format',
    requestOptions: {
      ip: '::ffff:127.0.0.1',
      origin: undefined,
    },
  },
  {
    name: 'Localhost with origin header',
    description: 'Request from localhost with origin header',
    requestOptions: {
      ip: '127.0.0.1',
      origin: 'http://localhost:3000',
    },
  },
  {
    name: 'Localhost hostname resolution',
    description: 'Request using localhost hostname',
    requestOptions: {
      ip: '127.0.0.1',
      origin: 'http://localhost',
    },
  },
  {
    name: 'Loopback range IPv4',
    description: 'Different IP in 127.x.x.x range',
    requestOptions: {
      ip: '127.0.0.2',
      origin: undefined,
    },
  },
  {
    name: 'Empty IP (direct connection)',
    description: 'Request without IP (should default to localhost)',
    requestOptions: {
      ip: '',
      origin: undefined,
    },
  },
];

/**
 * External request scenarios that should be blocked
 */
export const externalRequestScenarios: Array<{
  name: string;
  description: string;
  requestOptions: MockRequestOptions;
  expectedError: string;
  expectedMessage: string;
}> = [
  {
    name: 'External IPv4',
    description: 'Request from external IPv4 address',
    requestOptions: {
      ip: '192.168.1.100',
      origin: 'https://external-site.com',
    },
    expectedError: 'Domain not allowed',
    expectedMessage: 'Access denied for domain: external-site.com',
  },
  {
    name: 'External IPv6',
    description: 'Request from external IPv6 address',
    requestOptions: {
      ip: '2001:db8::1',
      origin: 'https://malicious-site.com',
    },
    expectedError: 'Domain not allowed',
    expectedMessage: 'Access denied for domain: malicious-site.com',
  },
  {
    name: 'Public IP with no origin',
    description: 'External IP without origin header',
    requestOptions: {
      ip: '8.8.8.8',
      origin: undefined,
    },
    expectedError: 'Access denied',
    expectedMessage: 'Access denied - no origin header and not from localhost',
  },
  {
    name: 'Spoofed origin with external IP',
    description: 'External IP trying to spoof localhost origin',
    requestOptions: {
      ip: '192.168.1.100',
      origin: 'http://localhost:3000',
    },
    expectedError: 'Domain not allowed',
    expectedMessage: 'Access denied for domain: localhost',
  },
  {
    name: 'Private network IP',
    description: 'Request from private network (not localhost)',
    requestOptions: {
      ip: '10.0.0.1',
      origin: 'http://internal-app.local',
    },
    expectedError: 'Domain not allowed',
    expectedMessage: 'Access denied for domain: internal-app.local',
  },
];

/**
 * Proxy request scenarios for testing proxy header handling
 */
export const proxyRequestScenarios: Array<{
  name: string;
  description: string;
  requestOptions: MockRequestOptions;
  shouldAllow: boolean;
  trustProxy: boolean;
}> = [
  {
    name: 'Proxy with localhost forwarded IP',
    description: 'Request through proxy with localhost in X-Forwarded-For',
    requestOptions: {
      ip: '192.168.1.1', // Proxy IP
      xForwardedFor: '127.0.0.1',
      origin: undefined,
    },
    shouldAllow: true,
    trustProxy: true,
  },
  {
    name: 'Proxy with external forwarded IP',
    description: 'Request through proxy with external IP in X-Forwarded-For',
    requestOptions: {
      ip: '192.168.1.1', // Proxy IP
      xForwardedFor: '8.8.8.8',
      origin: 'https://external.com',
    },
    shouldAllow: false,
    trustProxy: true,
  },
  {
    name: 'Proxy headers when trust disabled',
    description: 'Proxy headers ignored when TRUST_PROXY is false',
    requestOptions: {
      ip: '192.168.1.1', // Proxy IP
      xForwardedFor: '127.0.0.1',
      origin: undefined,
    },
    shouldAllow: false,
    trustProxy: false,
  },
];

/**
 * Edge case request scenarios for comprehensive testing
 */
export const edgeCaseScenarios: Array<{
  name: string;
  description: string;
  requestOptions: MockRequestOptions;
  expectedBehavior: 'allow' | 'block';
}> = [
  {
    name: 'Malformed origin header',
    description: 'Request with invalid origin format',
    requestOptions: {
      ip: '127.0.0.1',
      origin: 'not-a-valid-url',
    },
    expectedBehavior: 'allow', // Should allow because IP is localhost
  },
  {
    name: 'Very long origin header',
    description: 'Request with excessively long origin',
    requestOptions: {
      ip: '192.168.1.100',
      origin: 'https://' + 'a'.repeat(1000) + '.com',
    },
    expectedBehavior: 'block',
  },
  {
    name: 'Missing connection object',
    description: 'Request without connection.remoteAddress',
    requestOptions: {
      ip: '127.0.0.1',
      remoteAddress: undefined,
      origin: undefined,
    },
    expectedBehavior: 'allow',
  },
  {
    name: 'Multiple forwarded IPs',
    description: 'X-Forwarded-For with multiple IPs',
    requestOptions: {
      ip: '192.168.1.1',
      xForwardedFor: '127.0.0.1, 10.0.0.1, 192.168.1.100',
      origin: undefined,
    },
    expectedBehavior: 'allow', // First IP should be localhost
  },
];