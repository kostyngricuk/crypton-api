import type { NextFunction, Request, Response } from "express";
import { bearerAuth } from "../../../src/middleware/bearerAuth";

// Mock the env module
jest.mock("../../../src/config/env", () => ({
  getBearerTokens: jest.fn(() => ["test-token-123", "test-token-456"]),
  getLogSecurityEvents: jest.fn(() => true),
}));

describe("bearerAuth Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      get: jest.fn(),
      path: "/api/trades",
      ip: "127.0.0.1",
      connection: { remoteAddress: "127.0.0.1" } as any,
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();

    // Clear console.warn mock
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Valid Token Acceptance", () => {
    it("should accept request with valid Bearer token", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should accept request with second valid token", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-456");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should accept token with leading whitespace", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer  test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should accept token with trailing whitespace", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-123  ");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("Missing Authorization Header", () => {
    it("should reject request without Authorization header", () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Missing authorization",
          message: expect.stringContaining("Authorization header is required"),
        }),
      );
    });

    it("should reject request with empty Authorization header", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe("Invalid Token Rejection", () => {
    it("should reject request with invalid token", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer invalid-token");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Invalid token",
          message: expect.stringContaining("Invalid Bearer token"),
        }),
      );
    });

    it("should reject request with token that is substring of valid token", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe("Malformed Authorization Header", () => {
    it("should reject request with missing Bearer scheme", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Malformed header",
          message: expect.stringContaining("Malformed Authorization header"),
        }),
      );
    });

    it("should reject request with wrong scheme", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Basic test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should reject request with malformed header (no space)", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearertest-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should reject request with only Bearer scheme", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Malformed header",
        }),
      );
    });

    it("should reject request with only Bearer scheme and spaces", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer   ");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe("Bearer Scheme Case-Insensitivity", () => {
    it("should accept lowercase bearer scheme", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("bearer test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should accept uppercase BEARER scheme", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("BEARER test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should accept mixed case BeArEr scheme", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("BeArEr test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("Token Whitespace Trimming", () => {
    it("should trim leading spaces from token", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer    test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should trim trailing spaces from token", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-123    ");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should trim both leading and trailing spaces", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer   test-token-123   ");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("Authentication Failure Logging", () => {
    it("should log authentication failure with IP and path", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn");
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer invalid-token");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          clientIp: expect.any(String),
          path: "/api/trades",
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe("Health Check Exemption", () => {
    it("should allow health check endpoint without authentication", () => {
      mockRequest.path = "/api/health";
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow health check subpath without authentication", () => {
      mockRequest.path = "/api/health/detailed";
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should still work with authentication on health endpoint", () => {
      mockRequest.path = "/api/health";
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should require authentication for non-health endpoints", () => {
      mockRequest.path = "/api/trades";
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe("Multiple Token Support", () => {
    it("should accept first token from multiple tokens", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-123");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should accept second token from multiple tokens", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-456");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should reject token not in the list", () => {
      (mockRequest.get as jest.Mock).mockReturnValue("Bearer test-token-999");

      bearerAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});
