# API Reference

This document provides detailed information about the REST API endpoints available in the Crypton Telegram Bot.

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Bearer Token Authentication

All API endpoints (except `/api/health`) require Bearer token authentication.

**Request Header:**
```
Authorization: Bearer your-token-here
```

**Example:**
```bash
curl -H "Authorization: Bearer your-token-here" http://localhost:3001/api/trades
```

**Authentication Errors:**

Missing Authorization header:
```json
{
  "success": false,
  "error": "Missing authorization",
  "message": "Authorization header is required. Format: Authorization: Bearer <token>",
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

Invalid token:
```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Invalid Bearer token. Please check your authentication credentials.",
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

Invalid scheme:
```json
{
  "success": false,
  "error": "Invalid scheme",
  "message": "Authorization header must use Bearer scheme. Format: Authorization: Bearer <token>",
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

### Domain Whitelist

All API endpoints include domain whitelist validation. Ensure your domain is included in the `ALLOWED_DOMAINS` environment variable.

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string (only if success is false),
  "message": string (optional)
}
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the bot and trading server.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-09-22T10:30:00.000Z",
    "serverTime": 1695376200000,
    "uptime": 3600
  }
}
```

### Trades

#### GET /trades

Get a list of all active trades.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trade_123",
      "symbol": "BTCUSDT",
      "side": "buy",
      "amount": 0.1,
      "price": 50000,
      "status": "active",
      "createdAt": "2024-09-22T10:30:00.000Z",
      "updatedAt": "2024-09-22T10:30:00.000Z"
    }
  ]
}
```

#### POST /trades

Create a new trade.

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "side": "buy",
  "amount": 0.1,
  "price": 50000,
  "type": "limit"
}
```

**Parameters:**
- `symbol` (string, required): Trading pair symbol
- `side` (string, required): "buy" or "sell"
- `amount` (number, required): Trade amount
- `price` (number, optional): Limit price (required for limit orders)
- `type` (string, optional): "market" or "limit" (default: "limit")

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_123",
    "symbol": "BTCUSDT",
    "side": "buy",
    "amount": 0.1,
    "price": 50000,
    "status": "pending",
    "createdAt": "2024-09-22T10:30:00.000Z",
    "updatedAt": "2024-09-22T10:30:00.000Z"
  }
}
```

#### GET /trades/:id

Get a specific trade by ID.

**Parameters:**
- `id` (string): Trade ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_123",
    "symbol": "BTCUSDT",
    "side": "buy",
    "amount": 0.1,
    "price": 50000,
    "status": "active",
    "createdAt": "2024-09-22T10:30:00.000Z",
    "updatedAt": "2024-09-22T10:30:00.000Z"
  }
}
```

#### PUT /trades/:id

Update an existing trade.

**Parameters:**
- `id` (string): Trade ID

**Request Body:**
```json
{
  "amount": 0.2,
  "price": 51000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_123",
    "symbol": "BTCUSDT",
    "side": "buy",
    "amount": 0.2,
    "price": 51000,
    "status": "active",
    "createdAt": "2024-09-22T10:30:00.000Z",
    "updatedAt": "2024-09-22T10:35:00.000Z"
  }
}
```

#### DELETE /trades/:id

Cancel a trade.

**Parameters:**
- `id` (string): Trade ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_123",
    "symbol": "BTCUSDT",
    "side": "buy",
    "amount": 0.1,
    "price": 50000,
    "status": "cancelled",
    "createdAt": "2024-09-22T10:30:00.000Z",
    "updatedAt": "2024-09-22T10:40:00.000Z"
  },
  "message": "Trade cancelled successfully"
}
```

### Symbols

#### GET /symbols

Get all available trading symbols.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "BTCUSDT",
      "baseAsset": "BTC",
      "quoteAsset": "USDT",
      "status": "TRADING",
      "baseAssetPrecision": 8,
      "quotePrecision": 8,
      "minQty": 0.00001,
      "maxQty": 9000,
      "stepSize": 0.00001,
      "minNotional": 10
    }
  ]
}
```

#### GET /symbols/:symbol

Get information for a specific symbol.

**Parameters:**
- `symbol` (string): Symbol name (e.g., "NEARUSDT")

**Response:**
```json
{
  "success": true,
  "data": {
    "Symbol": "NEARUSDT",
    "Precision": 3,
    "IsTradeAllowed": true,
    "MarginMode": "CFD",
    "ProfitMode": "CFD",
    "ContractSize": 1,
    "MarginHedged": 0.5,
    "MarginFactor": 0.33,
    "MarginCurrency": "NEAR",
    "MarginCurrencyPrecision": 5,
    "ProfitCurrency": "USDT",
    "ProfitCurrencyPrecision": 6,
    "Description": "NEAR Protocol vs Tether",
    "Schedule": "Default",
    "Color": -1119007,
    "SwapEnabled": false,
    "SwapType": "Points",
    "SwapSizeShort": 0,
    "SwapSizeLong": 0,
    "TripleSwapDay": 0,
    "MinTradeAmount": 35,
    "MaxTradeAmount": 99999999999,
    "TradeAmountStep": 0.01,
    "CommissionType": "Percentage",
    "CommissionChargeType": "PerLot",
    "Commission": 0.5,
    "LimitsCommission": 0.3,
    "MinCommission": 0,
    "MinCommissionCurrency": "USD",
    "DefaultSlippage": 0.02,
    "StatusGroupId": "Default",
    "SecurityName": "Crypto NEAR/USDT F2X",
    "SecurityDescription": "NEAR Protocol vs Tether",
    "StopOrderMarginReduction": 1,
    "HiddenLimitOrderMarginReduction": 1,
    "IsCloseOnly": false,
    "IsLongOnly": false,
    "SlippageType": "Percent",
    "ExtendedName": "NEAR/USDT",
    "TradingMode": "Full"
  }
}
```

#### GET /symbols/ticks/:symbol

Get real-time tick data for a specific symbol.

**Parameters:**

- `symbol` (string): Symbol name (e.g., "NEARUSDT")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "Symbol": "NEARUSDT",
      "Timestamp": 1695376200000,
      "BestBid": {
        "Type": "Bid",
        "Price": 1.234,
        "Volume": 100.5
      },
      "BestAsk": {
        "Type": "Ask",
        "Price": 1.235,
        "Volume": 150.0
      },
      "IndicativeTick": true,
      "TickType": "Normal"
    }
  ]
}
```

### Account

#### GET /account/assets

Get all account assets.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "asset": "BTC",
      "free": 0.5,
      "locked": 0.1,
      "total": 0.6
    },
    {
      "asset": "USDT",
      "free": 1000,
      "locked": 200,
      "total": 1200
    }
  ]
}
```

#### GET /account/assets/:currency

Get account asset by currency.

**Parameters:**
- `currency` (string): Currency code (e.g., "BTC", "USDT")

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": "BTC",
    "free": 0.5,
    "locked": 0.1,
    "total": 0.6
  }
}
```

### Positions

#### GET /positions

Get all open positions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pos_123",
      "symbol": "BTCUSDT",
      "side": "long",
      "size": 0.1,
      "entryPrice": 50000,
      "markPrice": 51000,
      "pnl": 100,
      "percentage": 2.0,
      "leverage": 10,
      "margin": 500
    }
  ]
}
```

#### GET /positions/:identifier

Get position by ID or symbol.

**Parameters:**
- `identifier` (string): Position ID or symbol name

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pos_123",
    "symbol": "BTCUSDT",
    "side": "long",
    "size": 0.1,
    "entryPrice": 50000,
    "markPrice": 51000,
    "pnl": 100,
    "percentage": 2.0,
    "leverage": 10,
    "margin": 500
  }
}
```

### Server Information

#### GET /server/info

Get trading server information.

**Response:**
```json
{
  "success": true,
  "data": {
    "serverTime": 1695376200000,
    "timezone": "UTC",
    "rateLimits": [
      {
        "rateLimitType": "REQUEST_WEIGHT",
        "interval": "MINUTE",
        "intervalNum": 1,
        "limit": 1200
      }
    ],
    "exchangeFilters": []
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional context"
}
```

### Common Error Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (API credentials invalid)
- `403` - Forbidden (domain not in whitelist)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (API server unreachable)

## Rate Limiting

The API respects the rate limits of the external crypto trading API. Monitor your usage to avoid hitting rate limits.

## Examples

### Creating a Market Buy Order

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "buy",
    "amount": 0.001,
    "type": "market"
  }'
```

### Getting Account Balance

```bash
curl http://localhost:3000/api/account/assets
```

### Cancelling a Trade

```bash
curl -X DELETE http://localhost:3000/api/trades/trade_123
```