/**
 * Integration tests for Domain Whitelist Middleware - User Story 1: Secure Localhost Access
 * Tests end-to-end localhost API access through middleware
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { domainWhitelist } from '../../src/middleware/domainWhitelist.js';
import { VALID_IPV4_LOCALHOST_ADDRESSES, VALID_IPV6_LOCALHOST_ADDRESSES } from '../constants/localhost.js';

describe('Integration: Localhost API Access', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create test Express app with domain whitelist middleware
    app = express();
    app.use(domainWhitelist);
    
    // Add test endpoints
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'API is healthy' });
    });
    
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Test endpoint accessible' });
    });
  });

  describe('localhost IPv4 access', () => {
    test('should allow API access from standard localhost (127.0.0.1)', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        message: 'API is healthy',
      });
    });

    test('should allow API access with localhost origin header', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Test endpoint accessible',
      });
    });

    test('should allow API access with localhost hostname', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('localhost IPv6 access', () => {
    test('should allow API access from IPv6 localhost (::1)', async () => {
      // Note: In real integration, this would require IPv6 setup
      // For now, we'll simulate by ensuring middleware allows ::1
      const response = await request(app)
        .get('/api/health')
        .set('X-Forwarded-For', '::1') // Simulate IPv6 localhost
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('API endpoint functionality', () => {
    test('should preserve all API functionality for localhost requests', async () => {
      // Test multiple endpoints to ensure middleware doesn't break functionality
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);
      
      const testResponse = await request(app)
        .get('/api/test')
        .expect(200);

      expect(healthResponse.body.status).toBe('ok');
      expect(testResponse.body.message).toBe('Test endpoint accessible');
    });

    test('should handle POST requests from localhost', async () => {
      // Add a POST endpoint for testing
      app.post('/api/data', (req, res) => {
        res.json({ received: true, ip: req.ip });
      });

      const response = await request(app)
        .post('/api/data')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should handle different HTTP methods from localhost', async () => {
      // Add various method endpoints
      app.put('/api/update', (req, res) => {
        res.json({ method: 'PUT', allowed: true });
      });
      
      app.delete('/api/delete', (req, res) => {
        res.json({ method: 'DELETE', allowed: true });
      });

      const putResponse = await request(app)
        .put('/api/update')
        .expect(200);
      
      const deleteResponse = await request(app)
        .delete('/api/delete')
        .expect(200);

      expect(putResponse.body.allowed).toBe(true);
      expect(deleteResponse.body.allowed).toBe(true);
    });
  });

  describe('middleware performance', () => {
    test('should process localhost requests quickly (<100ms)', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);
      
      const processingTime = Date.now() - startTime;
      
      // Middleware should add minimal overhead
      expect(processingTime).toBeLessThan(100);
    });

    test('should maintain API response structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
    });
  });
});