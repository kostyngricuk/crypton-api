import { createHmac } from "node:crypto";
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios";
import { head } from "es-toolkit";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  ApiResponse,
  Asset,
  Position,
  ServerInfo,
  Trade,
  TradingSide,
  Symbol as TradingSymbol,
  TradingTick,
} from "../types/api.js";

export class CryptoApiClient {
  private readonly axiosClient: AxiosInstance;
  private readonly apiId: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiId = env.WEB_API_ID;
    this.apiKey = env.WEB_API_KEY;
    this.apiSecret = env.WEB_API_SECRET;
    this.apiBaseUrl = `https://${env.WEB_API_HOST}/api`;

    if (!this.apiId || !this.apiKey || !this.apiSecret) {
      throw new Error("API credentials are not set in environment variables");
    }

    // Create axios client with default configuration
    this.axiosClient = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 30000,
      headers: {
        Accept: "application/json",
      },
    });
  }

  private createSignature(timestamp: number, method: string, url: string, data?: unknown): string {
    const signature =
      timestamp + this.apiId + this.apiKey + method + url + (data ? JSON.stringify(data) : "");
    return createHmac("sha256", this.apiSecret).update(signature).digest("base64");
  }

  private async makeRequest<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    options: {
      params?: Record<string, string>;
      data?: unknown;
    } = {},
  ): Promise<T> {
    const { params, data } = options;

    const timestamp = Date.now();
    const signature = this.createSignature(timestamp, method, this.apiBaseUrl + endpoint, data);

    const axiosConfig: AxiosRequestConfig = {
      method,
      url: endpoint,
      params,
      data,
      headers: {
        Authorization: `HMAC ${this.apiId}:${this.apiKey}:${timestamp}:${signature}`,
      },
    };

    try {
      const response = await this.axiosClient.request<ApiResponse<T>>(axiosConfig);
      if (!response.data) {
        throw new AppError("API request failed", 400);
      }

      return response.data as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500;
        const errorData = axiosError.response?.data as { message?: string; error?: string } | null;

        throw new AppError(
          errorData?.message || errorData?.error || axiosError.message || "API request failed",
          status,
        );
      }
      throw new AppError(error instanceof Error ? error.message : "Unknown error occurred", 500);
    }
  }

  // Server info
  async getServerInfo(): Promise<ServerInfo> {
    return this.makeRequest("GET", "/v2/tradeserverinfo");
  }

  // Symbols
  async getSymbols(): Promise<TradingSymbol[]> {
    return this.makeRequest("GET", "/v2/symbol");
  }

  async getSymbol(symbol: string): Promise<TradingSymbol | undefined> {
    const filteredSymbols: TradingSymbol[] = await this.makeRequest("GET", `/v2/symbol/${symbol}`);

    return head(filteredSymbols);
  }

  async getTick(symbol: string): Promise<TradingTick[]> {
    return this.makeRequest("GET", `/v2/tick/${symbol}`);
  }

  // Trades
  async getTradesHistory(data: {
    TimestampFrom?: number;
    TimestampTo?: number;
    OrderId?: number;
    SkipCancelOrder?: boolean;
    RequestDirection?: "Forwards" | "Backwards";
  }): Promise<Trade[]> {
    return this.makeRequest("POST", "/v2/tradehistory", { data });
  }

  async getTrades(): Promise<Trade[]> {
    return this.makeRequest("GET", "/v2/trade");
  }

  async createTrade(trade: {
    Symbol: string;
    Side: TradingSide;
    Amount: string;
  }): Promise<Trade> {
    return this.makeRequest("POST", "/v2/trade", {
      data: {
        Type: "Market",
        ...trade,
      },
    });
  }

  async getTrade(id: string): Promise<Trade> {
    return this.makeRequest("GET", `/v2/trade/${id}`);
  }

  async cancelTrade(id: string): Promise<Trade> {
    return this.makeRequest("DELETE", `/v2/trade?Type=Cancel&Id=${id}`);
  }

  // Account
  async getAccountAssets(): Promise<Asset[]> {
    return this.makeRequest("GET", "/v2/asset");
  }

  async getAccountAsset(currency: string): Promise<Asset> {
    return this.makeRequest("GET", `/v2/asset/${currency}`);
  }

  // Positions
  async getPositions(): Promise<Position[]> {
    return this.makeRequest("GET", "/v2/position"); // TODO: check and fix it
  }

  async getPosition(identifier: string): Promise<Position> {
    return this.makeRequest("GET", `/v2/position/${identifier}`); // TODO: check and fix it
  }
}

// Singleton instance
export const cryptoApi = new CryptoApiClient();
