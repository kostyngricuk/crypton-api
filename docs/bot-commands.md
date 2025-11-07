# Telegram Bot Commands

This document provides detailed information about all available Telegram bot commands.

## Command List

### Basic Commands

#### `/start`
Welcome message and command list.

Shows an introduction to the bot and lists all available commands.

**Usage:**
```
/start
```

---

#### `/help`
Detailed help information.

Provides comprehensive help documentation about the bot's features and commands.

**Usage:**
```
/help
```

---

#### `/status`
Bot and server status.

Displays the current status of the bot and trading server connection.

**Usage:**
```
/status
```

**Response includes:**
- Bot uptime
- Server connection status
- API health status

---

### Account & Balance

#### `/balance`
Account balance overview.

Shows your current account balances for all available assets.

**Usage:**
```
/balance
```

**Response includes:**
- Available balance per asset
- Total balance in USD equivalent
- Margin information (if applicable)

---

### Market Data

#### `/symbols`
Available trading pairs.

Lists all available trading symbols/pairs on the exchange.

**Usage:**
```
/symbols
```

**Response includes:**
- Symbol name (e.g., BTCUSDT)
- Current price
- 24h change percentage

---

#### `/symbol <name>`
Detailed symbol information.

Provides detailed information about a specific trading symbol.

**Usage:**
```
/symbol BTCUSDT
```

**Parameters:**
- `<name>` - Symbol name (e.g., BTCUSDT, ETHUSDT)

**Response includes:**
- Current price
- 24h high/low
- 24h volume
- Bid/ask spread
- Price change percentage

---

### Trading Operations

#### `/trades`
List active trades.

Shows all your active trades and recent trade history.

**Usage:**
```
/trades
```

**Response includes:**
- Trade ID
- Symbol
- Side (buy/sell)
- Amount
- Price
- Status
- Timestamp

---

#### `/positions`
Open positions summary.

Displays all your currently open trading positions.

**Usage:**
```
/positions
```

**Response includes:**
- Position ID
- Symbol
- Side (long/short)
- Size
- Entry price
- Current price
- Unrealized P&L

---

#### `/cancel <id>`
Cancel specific trade.

Cancels an active trade by its ID.

**Usage:**
```
/cancel 12345
```

**Parameters:**
- `<id>` - Trade ID to cancel

**Response:**
- Confirmation of cancellation
- Updated trade status

---

## Command Tips

1. **Case Sensitivity**: Commands are case-insensitive
2. **Parameters**: Some commands require parameters (e.g., `/symbol BTCUSDT`)
3. **Error Messages**: The bot will provide helpful error messages if a command is used incorrectly
4. **Rate Limits**: Be mindful of rate limits when using commands frequently

## Getting Help

If you encounter issues with any command:
1. Use `/help` for general assistance
2. Check the [API Reference](./api-reference.md) for technical details
3. Review the [Setup Guide](./setup.md) for configuration issues
4. Ensure your bot token and API credentials are correctly configured

## Examples

### Check Balance and Make a Trade Decision
```
1. /balance          # Check available funds
2. /symbols          # View available pairs
3. /symbol BTCUSDT   # Check specific pair details
4. /trades           # View current trades
```

### Monitor Active Positions
```
1. /positions        # Check all positions
2. /trades           # View active trades
3. /cancel 12345     # Cancel if needed
```

---

For REST API equivalents of these commands, see the [API Reference](./api-reference.md).
