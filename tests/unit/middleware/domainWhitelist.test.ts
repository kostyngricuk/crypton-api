/**
 * Unit tests for Domain Whitelist Middleware - User Story 1: Secure Localhost Access
 * Tests IPv4, IPv6, and hostname localhost detection functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { domainWhitelist } from '../../../src/middleware/domainWhitelist.js';
import { createMiddlewareTestContext, expectMiddlewarePassThrough } from '../../utils/mockExpress.js';
import { 
  VALID_IPV4_LOCALHOST_ADDRESSES,
  VALID_IPV6_LOCALHOST_ADDRESSES,
  LOCALHOST_ORIGIN_PATTERNS 
} from '../../constants/localhost.js';

describe('Domain Whitelist Middleware - User Story 1: Secure Localhost Access', () => {
  
  describe('IPv4 localhost detection', () => {
    test.each(VALID_IPV4_LOCALHOST_ADDRESSES)(
      'should allow requests from IPv4 localhost address: %s',
      (ipAddress) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: ipAddress,
        });

        domainWhitelist(req, res, next);

        expectMiddlewarePassThrough(next, responseData);
      }
    );

    test('should allow requests from localhost with no origin header', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '127.0.0.1',
        origin: undefined,
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });

    test('should allow requests from 127.x.x.x range', () => {
      const testAddresses = ['127.0.0.2', '127.1.1.1', '127.255.255.255'];
      
      testAddresses.forEach((ipAddress) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: ipAddress,
        });

        domainWhitelist(req, res, next);

        expectMiddlewarePassThrough(next, responseData);
      });
    });
  });

  describe('IPv6 localhost detection', () => {
    test.each(VALID_IPV6_LOCALHOST_ADDRESSES)(
      'should allow requests from IPv6 localhost address: %s',
      (ipAddress) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: ipAddress,
        });

        domainWhitelist(req, res, next);

        expectMiddlewarePassThrough(next, responseData);
      }
    );

    test('should allow requests from standard IPv6 localhost (::1)', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '::1',
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });

    test('should allow requests from IPv4-mapped IPv6 localhost', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '::ffff:127.0.0.1',
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });
  });

  describe('localhost hostname detection', () => {
    test.each(LOCALHOST_ORIGIN_PATTERNS)(
      'should allow requests with localhost origin: %s',
      (origin) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: '127.0.0.1',
          origin,
        });

        domainWhitelist(req, res, next);

        expectMiddlewarePassThrough(next, responseData);
      }
    );

    test('should allow requests with localhost hostname (case insensitive)', () => {
      const localhostVariants = ['localhost', 'LOCALHOST', 'Localhost'];
      
      localhostVariants.forEach((hostname) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: '127.0.0.1',
          origin: `http://${hostname}:3000`,
        });

        domainWhitelist(req, res, next);

        expectMiddlewarePassThrough(next, responseData);
      });
    });

    test('should resolve localhost hostname to allow access', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '127.0.0.1',
        origin: 'http://localhost',
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });
  });

  describe('edge cases for localhost detection', () => {
    test('should allow requests with empty IP (default to localhost)', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '',
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });

    test('should allow requests without connection.remoteAddress', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '127.0.0.1',
        remoteAddress: undefined,
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });

    test('should prioritize req.ip over connection.remoteAddress for localhost detection', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '127.0.0.1',
        remoteAddress: '192.168.1.100',
      });

      domainWhitelist(req, res, next);

      expectMiddlewarePassThrough(next, responseData);
    });
  });
});

describe('Domain Whitelist Middleware - User Story 2: Block External Access', () => {
  
  describe('external domain blocking', () => {
    test('should deny requests from external domains', () => {
      const externalDomains = [
        'http://example.com',
        'https://malicious-site.org',
        'http://external-api.com:8080',
        'https://attack.site.net/path'
      ];

      externalDomains.forEach((origin) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: '192.168.1.100', // External IP
          origin,
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          error: 'Domain not allowed',
          message: expect.stringContaining('Access denied for domain:'),
          timestamp: expect.any(String)
        });
      });
    });

    test('should deny requests with external IP and no Origin header', () => {
      const externalIPs = ['192.168.1.100', '10.0.0.1', '203.0.113.1'];

      externalIPs.forEach((ip) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip,
          origin: undefined,
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          error: 'Access denied',
          message: 'Access denied - no origin header and not from localhost',
          timestamp: expect.any(String)
        });
      });
    });
  });

  describe('external IP blocking', () => {
    test('should deny requests from external IPv4 addresses', () => {
      const externalIPv4s = [
        '192.168.1.100',
        '10.0.0.1',
        '172.16.0.1',
        '203.0.113.1',
        '8.8.8.8'
      ];

      externalIPv4s.forEach((ip) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip,
          origin: 'http://example.com',
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          error: 'Domain not allowed',
          timestamp: expect.any(String)
        });
      });
    });

    test('should deny requests from external IPv6 addresses', () => {
      const externalIPv6s = [
        '2001:db8::1',
        'fe80::1',
        '2001:4860:4860::8888',
        'fc00::1'
      ];

      externalIPv6s.forEach((ip) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip,
          origin: 'http://example.com',
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          error: 'Domain not allowed',
          timestamp: expect.any(String)
        });
      });
    });
  });

  describe('header spoofing protection', () => {
    test('should deny localhost Origin with external IP', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '192.168.1.100', // External IP
        origin: 'http://localhost:3000', // Spoofed localhost origin
      });

      domainWhitelist(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(responseData.status).toBe(403);
      expect(responseData.jsonResponse).toMatchObject({
        success: false,
        error: 'Domain not allowed',
        timestamp: expect.any(String)
      });
    });

    test('should validate actual client IP vs Origin header', () => {
      const spoofingScenarios = [
        { ip: '10.0.0.1', origin: 'http://localhost' },
        { ip: '192.168.1.100', origin: 'http://127.0.0.1' },
        { ip: '8.8.8.8', origin: 'http://localhost:8080' }
      ];

      spoofingScenarios.forEach(({ ip, origin }) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip,
          origin,
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          timestamp: expect.any(String)
        });
      });
    });

    test('should handle invalid Origin header formats', () => {
      const invalidOrigins = [
        'not-a-url',
        'ftp://invalid-protocol.com',
        'javascript:alert("xss")',
        '//evil.com/redirect'
      ];

      invalidOrigins.forEach((origin) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: '192.168.1.100',
          origin,
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          timestamp: expect.any(String)
        });
      });
    });
  });
});

describe('Domain Whitelist Middleware - User Story 3: Proper Error Handling', () => {
  
  describe('consistent error response format', () => {
    test('should return standardized SecurityResponse format for all denials', () => {
      const denialScenarios = [
        { ip: '192.168.1.100', origin: 'http://example.com', expectedError: 'Domain not allowed' },
        { ip: '10.0.0.1', origin: undefined, expectedError: 'Access denied' },
        { ip: '192.168.1.100', origin: 'http://localhost', expectedError: 'Domain not allowed' }, // Spoofing
        { ip: '8.8.8.8', origin: 'invalid-url', expectedError: 'Domain not allowed' }
      ];

      denialScenarios.forEach(({ ip, origin, expectedError }) => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip,
          origin,
        });

        domainWhitelist(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(responseData.status).toBe(403);
        expect(responseData.jsonResponse).toMatchObject({
          success: false,
          error: expectedError,
          message: expect.any(String),
          timestamp: expect.any(String)
        });
        
        // Verify timestamp is valid ISO string
        expect(() => new Date(responseData.jsonResponse.timestamp)).not.toThrow();
        expect(new Date(responseData.jsonResponse.timestamp).toISOString()).toBe(responseData.jsonResponse.timestamp);
      });
    });

    test('should include request correlation via timestamp for debugging', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '192.168.1.100',
        origin: 'http://external.com',
      });

      const startTime = Date.now();
      domainWhitelist(req, res, next);
      const endTime = Date.now();

      expect(responseData.jsonResponse.timestamp).toBeDefined();
      const responseTime = new Date(responseData.jsonResponse.timestamp).getTime();
      expect(responseTime).toBeGreaterThanOrEqual(startTime);
      expect(responseTime).toBeLessThanOrEqual(endTime);
    });
  });

  describe('security logging functionality', () => {
    test('should log security events when enabled', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '192.168.1.100',
        origin: 'http://attacker.com',
      });

      domainWhitelist(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SECURITY] External domain access denied',
        expect.objectContaining({
          timestamp: expect.any(String),
          domain: 'attacker.com',
          origin: 'http://attacker.com',
          clientIp: '192.168.1.100'
        })
      );

      consoleSpy.mockRestore();
    });

    test('should log spoofing attempts with detailed context', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '10.0.0.1', // External IP
        origin: 'http://localhost', // Spoofed localhost
      });

      domainWhitelist(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SECURITY] Header spoofing attempt detected',
        expect.objectContaining({
          timestamp: expect.any(String),
          spoofedOrigin: 'http://localhost',
          spoofedDomain: 'localhost',
          actualClientIp: '10.0.0.1'
        })
      );

      consoleSpy.mockRestore();
    });

    test('should include user agent in security logs when available', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '192.168.1.100',
        origin: 'http://malicious.org',
        userAgent: 'Mozilla/5.0 (Attacker Browser)'
      });

      domainWhitelist(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SECURITY] External domain access denied',
        expect.objectContaining({
          userAgent: 'Mozilla/5.0 (Attacker Browser)'
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('error message clarity without exposing internals', () => {
    test('should provide clear error messages for users', () => {
      const testCases = [
        { 
          scenario: { ip: '192.168.1.100', origin: 'http://example.com' },
          expectMessage: 'Access denied for domain: example.com'
        },
        { 
          scenario: { ip: '10.0.0.1', origin: undefined },
          expectMessage: 'Access denied - no origin header and not from localhost'
        },
        { 
          scenario: { ip: '8.8.8.8', origin: 'http://localhost' },
          expectMessage: 'Access denied for domain: localhost'
        }
      ];

      testCases.forEach(({ scenario, expectMessage }) => {
        const { req, res, next, responseData } = createMiddlewareTestContext(scenario);

        domainWhitelist(req, res, next);

        expect(responseData.jsonResponse.message).toBe(expectMessage);
      });
    });

    test('should not expose system internals in error messages', () => {
      const { req, res, next, responseData } = createMiddlewareTestContext({
        ip: '192.168.1.100',
        origin: 'http://attacker.com',
      });

      domainWhitelist(req, res, next);

      const message = responseData.jsonResponse.message.toLowerCase();
      
      // Should not contain internal system information
      expect(message).not.toContain('middleware');
      expect(message).not.toContain('config');
      expect(message).not.toContain('internal');
      expect(message).not.toContain('server');
      expect(message).not.toContain('process');
      expect(message).not.toContain('env');
      expect(message).not.toContain('path');
      expect(message).not.toContain('file');
      expect(message).not.toContain('function');
    });

    test('should maintain security through non-informative error messages', () => {
      const externalOrigins = [
        'http://example.com',
        'http://127.0.0.1', // Should be treated as spoofing when from external IP
        'http://localhost'  // Should be treated as spoofing when from external IP
      ];
      
      const messages = externalOrigins.map(origin => {
        const { req, res, next, responseData } = createMiddlewareTestContext({
          ip: '192.168.1.100', // External IP
          origin,
        });

        domainWhitelist(req, res, next);
        return responseData.jsonResponse.message;
      });

      // All should use same format, not revealing specifics about why blocked
      messages.forEach(message => {
        expect(message).toMatch(/^Access denied for domain: .+$/);
      });
    });
  });
});