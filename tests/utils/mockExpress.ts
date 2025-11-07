/**
 * Test utilities for mocking Express Request/Response objects
 * Used across domain whitelist middleware tests
 */

import type { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

/**
 * Options for creating mock Express Request objects
 */
export interface MockRequestOptions {
  ip?: string;
  origin?: string;
  referer?: string;
  userAgent?: string;
  remoteAddress?: string;
  xForwardedFor?: string;
  xRealIp?: string;
}

/**
 * Creates a mock Express Request object for testing
 */
export function createMockRequest(options: MockRequestOptions = {}): Partial<Request> {
  const req: Partial<Request> = {
    ip: options.ip || '127.0.0.1',
    get: jest.fn((header: string): string | undefined => {
      switch (header.toLowerCase()) {
        case 'origin':
          return options.origin;
        case 'referer':
          return options.referer;
        case 'user-agent':
          return options.userAgent;
        case 'x-forwarded-for':
          return options.xForwardedFor;
        case 'x-real-ip':
          return options.xRealIp;
        default:
          return undefined;
      }
    }) as any,
    connection: {
      remoteAddress: options.remoteAddress || options.ip || '127.0.0.1',
    } as any,
  };

  return req;
}

/**
 * Creates a mock Express Response object for testing
 */
export function createMockResponse(): { res: Partial<Response>; responseData: any } {
  const responseData: any = {
    jsonData: undefined,
    sendData: undefined,
    status: undefined,
    jsonResponse: undefined,
  };
  
  const statusMock = jest.fn((code: number) => {
    responseData.status = code;
    return res;
  });
  
  const jsonMock = jest.fn((data: any) => {
    responseData.jsonData = data;
    responseData.jsonResponse = data;
    return res;
  });
  
  const sendMock = jest.fn((data: any) => {
    responseData.sendData = data;
    return res;
  });
  
  const res: Partial<Response> = {
    status: statusMock as any,
    json: jsonMock as any,
    send: sendMock as any,
  };

  // Add mock functions to responseData for testing
  responseData.json = jsonMock;
  responseData.send = sendMock;

  return { res, responseData };
}

/**
 * Creates a mock Express NextFunction for testing
 */
export function createMockNext(): NextFunction {
  return jest.fn();
}

/**
 * Helper to create a complete middleware test context
 */
export function createMiddlewareTestContext(requestOptions: MockRequestOptions = {}) {
  const req = createMockRequest(requestOptions);
  const { res, responseData } = createMockResponse();
  const next = createMockNext();

  return {
    req: req as Request,
    res: res as Response,
    next,
    responseData,
  };
}

/**
 * Test helper to verify 403 Forbidden response format
 */
/**
 * Test helper to verify security response format
 */
export function expectSecurityResponse(responseData: any, expectedError: string, expectedMessage: string) {
  expect(responseData.json).toHaveBeenCalledTimes(1);
  expect(responseData.jsonData).toEqual({
    success: false,
    error: expectedError,
    message: expectedMessage,
    timestamp: expect.any(String),
  });
}

/**
 * Test helper to verify successful middleware pass-through
 */
export function expectMiddlewarePassThrough(next: NextFunction, responseData: any) {
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith();
  expect(responseData.json).not.toHaveBeenCalled();
}