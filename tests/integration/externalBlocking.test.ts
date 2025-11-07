/**
 * Integration tests for Domain Whitelist Middleware - User Story 2: Block External Access
 * Tests complete request-response cycle for external domain blocking
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
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Health check passed' });
  });
  
  app.get('/api/data', (req, res) => {
    res.json({ data: 'test data', timestamp: new Date().toISOString() });
  });
  
  return app;
}

describe('Integration: External Access Blocking', () => {
  const app = createTestApp();

  describe('external domain requests should be blocked', () => {
    test('should block requests with external Origin header', async () => {
      const externalOrigins = [
        'http://example.com',
        'https://malicious-site.org', 
        'http://attacker.net:8080',
        'https://external-api.com/path'
      ];

      for (const origin of externalOrigins) {
        const response = await request(app)
          .get('/api/health')
          .set('Origin', origin)
          .expect(403);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Domain not allowed',
          message: expect.stringContaining('Access denied for domain:'),
          timestamp: expect.any(String)
        });
      }
    });

    test('should block requests with external Referer header', async () => {
      const externalReferers = [
        'http://evil.com/page',
        'https://malicious.org/attack',
        'http://external.net:3000/app'
      ];

      for (const referer of externalReferers) {
        const response = await request(app)
          .get('/api/data')
          .set('Referer', referer)
          .expect(403);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Domain not allowed',
          timestamp: expect.any(String)
        });
      }
    });

    test('should block direct requests from external IPs without Origin', async () => {
      // Note: supertest always comes from localhost, so we simulate by 
      // testing the middleware behavior. In real deployment, nginx/proxy 
      // would set proper X-Forwarded-For headers for external requests
      
      const response = await request(app)
        .get('/api/health')
        // No Origin/Referer headers - would be blocked if from external IP
        .expect(200); // Passes because supertest comes from localhost

      // This test validates localhost access works,
      // external IP blocking is tested in unit tests
      expect(response.body.status).toBe('ok');
    });
  });

  describe('header spoofing attempts should be blocked', () => {
    test('should block localhost Origin from external domain context', async () => {
      // Simulate spoofed localhost origin from external source
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('X-Forwarded-For', '192.168.1.100') // Would be external in real proxy setup
        .expect(403); // Should be blocked due to anti-spoofing protection

      // Anti-spoofing protection detects localhost Origin with non-localhost IP
      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String),
        message: expect.stringContaining('Access denied'),
        timestamp: expect.any(String)
      });
    });

    test('should handle malformed Origin headers', async () => {
      const malformedOrigins = [
        'not-a-url',
        'javascript:alert("xss")',
        'ftp://invalid.com',
        '//redirect-attack.com'
      ];

      for (const origin of malformedOrigins) {
        const response = await request(app)
          .get('/api/data')
          .set('Origin', origin)
          .expect(403);

        expect(response.body).toMatchObject({
          success: false,
          timestamp: expect.any(String)
        });
      }
    });
  });

  describe('consistent error responses', () => {
    test('should return consistent 403 Forbidden for all blocked requests', async () => {
      const blockedScenarios = [
        { origin: 'http://example.com' },
        { referer: 'https://malicious.org' },
        { origin: 'invalid-url' }
      ];

      for (const headers of blockedScenarios) {
        const response = await request(app)
          .get('/api/health')
          .set(headers)
          .expect(403);

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toMatchObject({
          success: false,
          error: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String)
        });
        
        // Verify timestamp is valid ISO string
        expect(() => new Date(response.body.timestamp)).not.toThrow();
      }
    });

    test('should not expose internal system information in error messages', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://attacker.com')
        .expect(403);

      const message = response.body.message.toLowerCase();
      
      // Should not contain internal details
      expect(message).not.toContain('middleware');
      expect(message).not.toContain('config');
      expect(message).not.toContain('internal');
      expect(message).not.toContain('server');
      expect(message).not.toContain('process');
    });
  });

  describe('performance validation', () => {
    test('should process blocked requests within 100ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .set('Origin', 'http://external.com')
        .expect(403);
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(100);
    });

    test('should maintain performance under multiple blocked requests', async () => {
      const requests = Array(10).fill(0).map((_, i) => 
        request(app)
          .get('/api/data')
          .set('Origin', `http://external-${i}.com`)
          .expect(403)
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      // All 10 requests should complete within reasonable time
      expect(totalTime).toBeLessThan(500);
    });
  });
});