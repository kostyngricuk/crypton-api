import express from "express";
import request from "supertest";
import { bearerAuth } from "../../src/middleware/bearerAuth.js";

// Mock the env module to provide test tokens
jest.mock("../../src/config/env", () => ({
  getBearerTokens: jest.fn(() => ["test-token-local-dev-12345", "test-token-n8n-67890"]),
  getLogSecurityEvents: jest.fn(() => false), // Disable logging in tests
}));

describe("Bearer Authentication - Integration Tests", () => {
  let app: express.Application;
  const validToken = "test-token-local-dev-12345";
  const validToken2 = "test-token-n8n-67890";
  const invalidToken = "invalid-token-xyz";

  beforeEach(() => {
    // Create test Express app with Bearer authentication middleware
    app = express();
    app.use(express.json());
    app.use(bearerAuth);

    // Add test endpoints
    app.get("/api/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });

    app.get("/api/trades", (req, res) => {
      res.status(200).json({ data: "trades" });
    });

    app.get("/api/symbols", (req, res) => {
      res.status(200).json({ data: "symbols" });
    });

    app.get("/api/account", (req, res) => {
      res.status(200).json({ data: "account" });
    });

    app.get("/api/positions", (req, res) => {
      res.status(200).json({ data: "positions" });
    });

    app.get("/api/server", (req, res) => {
      res.status(200).json({ data: "server" });
    });
  });

  describe("Protected Endpoints - Trades", () => {
    it("should allow access with valid Bearer token", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it("should reject access without Bearer token", async () => {
      const response = await request(app).get("/api/trades");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: "Missing authorization",
      });
    });

    it("should reject access with invalid Bearer token", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: "Invalid token",
      });
    });
  });

  describe("Protected Endpoints - Symbols", () => {
    it("should allow access with valid Bearer token", async () => {
      const response = await request(app)
        .get("/api/symbols")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it("should reject access without Bearer token", async () => {
      const response = await request(app).get("/api/symbols");

      expect(response.status).toBe(401);
    });
  });

  describe("Protected Endpoints - Account", () => {
    it("should allow access with valid Bearer token", async () => {
      const response = await request(app)
        .get("/api/account")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it("should reject access without Bearer token", async () => {
      const response = await request(app).get("/api/account");

      expect(response.status).toBe(401);
    });
  });

  describe("Protected Endpoints - Positions", () => {
    it("should allow access with valid Bearer token", async () => {
      const response = await request(app)
        .get("/api/positions")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it("should reject access without Bearer token", async () => {
      const response = await request(app).get("/api/positions");

      expect(response.status).toBe(401);
    });
  });

  describe("Protected Endpoints - Server Info", () => {
    it("should allow access with valid Bearer token", async () => {
      const response = await request(app)
        .get("/api/server")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it("should reject access without Bearer token", async () => {
      const response = await request(app).get("/api/server");

      expect(response.status).toBe(401);
    });
  });

  describe("Health Check Exemption", () => {
    it("should allow access to health endpoint without authentication", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).not.toBe(401);
      expect(response.status).toBe(200);
    });

    it("should still work with authentication on health endpoint", async () => {
      const response = await request(app)
        .get("/api/health")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
      expect(response.status).toBe(200);
    });
  });

  describe("Multiple Token Support", () => {
    it("should accept first valid token", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it("should accept second valid token", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", `Bearer ${validToken2}`);

      expect(response.status).not.toBe(401);
    });

    it("should work across different endpoints with different tokens", async () => {
      const response1 = await request(app)
        .get("/api/symbols")
        .set("Authorization", `Bearer ${validToken}`);

      const response2 = await request(app)
        .get("/api/account")
        .set("Authorization", `Bearer ${validToken2}`);

      expect(response1.status).not.toBe(401);
      expect(response2.status).not.toBe(401);
    });
  });

  describe("Malformed Authorization Headers", () => {
    it("should reject request with wrong scheme", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", `Basic ${validToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: "Invalid scheme",
      });
    });

    it("should reject request with missing scheme", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", validToken);

      expect(response.status).toBe(401);
    });

    it("should reject request with only Bearer scheme", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", "Bearer");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: "Malformed header",
      });
    });
  });

  describe("Response Format", () => {
    it("should return standardized error response for missing auth", async () => {
      const response = await request(app).get("/api/trades");

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should return standardized error response for invalid token", async () => {
      const response = await request(app)
        .get("/api/trades")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
