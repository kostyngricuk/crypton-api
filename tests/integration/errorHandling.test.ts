/**
 * Integration tests for Domain Whitelist Middleware - User Story 3: Proper Error Handling
 * Tests complete error handling flow and response consistency
 */

import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { domainWhitelist } from '../../src/middleware/domainWhitelist.js';

// Create test Express app
function createTestApp() {
  const app = express();
  
  // Apply domain whitelist middleware
  app.use(domainWhitelist);
  
  // Test endpoints
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint reached', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/secure', (req, res) => {
    res.json({ data: 'secure data', user: 'test' });
  });
  
  return app;
}

describe('Integration: Proper Error Handling', () => {
  const app = createTestApp();

  describe('consistent error response format', () => {
    test('should return standardized JSON error format for all denial types', async () => {
      const denialScenarios = [
        { origin: 'http://external.com', description: 'external domain' },
        { origin: 'https://malicious.org', description: 'malicious site' },
        { origin: 'invalid-url-format', description: 'invalid URL format' },
        { origin: 'ftp://wrong-protocol.com', description: 'wrong protocol' }
      ];

      for (const { origin, description } of denialScenarios) {
        const response = await request(app)
          .get('/api/test')
          .set('Origin', origin)
          .expect(403);

        // Verify consistent response structure
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toMatchObject({
          success: false,
          error: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String)
        });

        // Verify timestamp is valid ISO string
        expect(() => new Date(response.body.timestamp)).not.toThrow();
        expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);

        // Verify error types are appropriate
        expect(['Domain not allowed', 'Access denied', 'Invalid origin']).toContain(response.body.error);

        console.log(`✅ ${description}: ${response.body.error} - ${response.body.message}`);
      }
    });

    test('should include proper HTTP status codes and headers', async () => {
      const response = await request(app)
        .get('/api/secure')
        .set('Origin', 'http://attacker.com')
        .expect(403);

      expect(response.status).toBe(403);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body.success).toBe(false);
    });

    test('should maintain consistent response timing for security', async () => {
      const timings = [];
      
      const testCases = [
        'http://example.com',
        'http://malicious.org', 
        'invalid-format',
        'http://external.domain.com' // External domain that should be blocked
      ];

      for (const origin of testCases) {
        const startTime = Date.now();
        
        await request(app)
          .get('/api/test')
          .set('Origin', origin)
          .expect(403);
          
        const duration = Date.now() - startTime;
        timings.push(duration);
      }

      // All responses should be reasonably fast and similar in timing
      timings.forEach(timing => {
        expect(timing).toBeLessThan(100); // Should be under 100ms
      });

      // No response should be significantly slower (timing attack protection)
      const avgTiming = timings.reduce((a, b) => a + b) / timings.length;
      timings.forEach(timing => {
        expect(Math.abs(timing - avgTiming)).toBeLessThan(50); // Within 50ms of average
      });
    });
  });

  describe('error message quality and security', () => {
    test('should provide user-friendly error messages', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://example.com')
        .expect(403);

      const message = response.body.message;
      
      // Should be clear and informative
      expect(message).toContain('Access denied');
      expect(message).toContain('example.com');
      expect(message.length).toBeGreaterThan(10); // Not too terse
      expect(message.length).toBeLessThan(200); // Not too verbose
    });

    test('should not expose system internals in any error scenario', async () => {
      const testOrigins = [
        'http://external.com',
        'invalid-url',
        'javascript:alert("xss")',
        'http://badactor.com', // External domain that should be blocked
        '//redirect-attack.com'
      ];

      for (const origin of testOrigins) {
        const response = await request(app)
          .get('/api/test')
          .set('Origin', origin)
          .expect(403);

        const fullResponse = JSON.stringify(response.body).toLowerCase();
        
        // Should not contain internal system information
        expect(fullResponse).not.toContain('middleware');
        expect(fullResponse).not.toContain('config');
        expect(fullResponse).not.toContain('internal');
        expect(fullResponse).not.toContain('process');
        expect(fullResponse).not.toContain('env');
        expect(fullResponse).not.toContain('stack');
        expect(fullResponse).not.toContain('error:');
        expect(fullResponse).not.toContain('exception');
        expect(fullResponse).not.toContain('file');
        expect(fullResponse).not.toContain('line');
      }
    });

    test('should maintain professional tone in error messages', async () => {
      const response = await request(app)
        .get('/api/secure')
        .set('Origin', 'http://malicious-site.org')
        .expect(403);

      const message = response.body.message;
      
      // Should be professional, not hostile or revealing
      expect(message).not.toContain('blocked');
      expect(message).not.toContain('unauthorized');
      expect(message).not.toContain('forbidden');
      expect(message).not.toContain('hack');
      expect(message).not.toContain('attack');
      expect(message).not.toContain('malicious');
      
      // Should be neutral and informative
      expect(message).toMatch(/^Access denied/);
    });
  });

  describe('performance under error conditions', () => {
    test('should handle multiple concurrent blocked requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();
      
      const requests = Array(concurrentRequests).fill(0).map((_, i) =>
        request(app)
          .get('/api/test')
          .set('Origin', `http://attacker-${i}.com`)
          .expect(403)
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All should return proper error responses
      responses.forEach(response => {
        expect(response.body).toMatchObject({
          success: false,
          error: 'Domain not allowed',
          timestamp: expect.any(String)
        });
      });

      // Should handle concurrent blocked requests efficiently
      expect(totalTime).toBeLessThan(1000); // All 10 requests in under 1 second
      expect(totalTime / concurrentRequests).toBeLessThan(100); // Average under 100ms per request
    });

    test('should not degrade performance for valid requests after errors', async () => {
      // First, generate some blocked requests
      await Promise.all([
        request(app).get('/api/test').set('Origin', 'http://bad1.com').expect(403),
        request(app).get('/api/test').set('Origin', 'http://bad2.com').expect(403),
        request(app).get('/api/test').set('Origin', 'http://bad3.com').expect(403)
      ]);

      // Then test that valid requests still work quickly
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.message).toBe('Test endpoint reached');
      expect(duration).toBeLessThan(100); // Should still be fast
    });
  });
});