# n8n Integration Guide

This guide explains how to integrate the Crypton Telegram Bot with n8n automation workflows.

## Overview

The Crypton Telegram Bot is designed to work seamlessly with n8n, a powerful workflow automation tool. You can use n8n to:

- Automate trading based on external signals
- Create complex trading strategies
- Monitor market conditions and execute trades
- Build custom notification systems
- Integrate with other services and APIs

## Prerequisites

- n8n instance running (cloud or self-hosted)
- Crypton Telegram Bot deployed and accessible
- Bot API endpoint URL
- Domain whitelist configured

## Setting Up Domain Whitelist

1. **Identify your n8n domain:**
   - For n8n cloud: `n8n.cloud` or your custom domain
   - For self-hosted: your server's domain or IP

2. **Add to ALLOWED_DOMAINS:**
   ```bash
   # In your .env file
   ALLOWED_DOMAINS=localhost,your-n8n-domain.com
   ```

3. **Restart the bot** to apply changes

## Basic Workflow Setup

### 1. HTTP Request Node Configuration

Most n8n workflows will use the HTTP Request node to communicate with the bot's API.

**Basic Configuration:**
- **Method**: GET/POST/PUT/DELETE (depending on endpoint)
- **URL**: `http://your-bot-domain:3000/api/{endpoint}`
- **Authentication**: None (domain-based whitelist)
- **Headers**: 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

## Common Use Cases

### Use Case 1: Automated Trading Signal

Create trades automatically when receiving signals from external sources.

**Workflow:**
```
Webhook Trigger → Process Signal → HTTP Request (Create Trade) → Send Notification
```

**HTTP Request Configuration:**
```json
{
  "method": "POST",
  "url": "http://your-bot-domain:3000/api/trades",
  "body": {
    "symbol": "{{ $json.symbol }}",
    "side": "{{ $json.side }}",
    "amount": "{{ $json.amount }}",
    "type": "market"
  }
}
```

---

### Use Case 2: Portfolio Monitoring

Monitor your portfolio and receive alerts on specific conditions.

**Workflow:**
```
Schedule Trigger → Get Positions → Evaluate Conditions → Send Alert
```

**Get Positions Node:**
```json
{
  "method": "GET",
  "url": "http://your-bot-domain:3000/api/positions"
}
```

**Example Output Processing:**
```javascript
// In Function node
const positions = $input.item.json.data;
const alerts = [];

for (const position of positions) {
  const profit = position.unrealizedPnl;
  const profitPercent = (profit / position.margin) * 100;
  
  if (profitPercent > 10) {
    alerts.push({
      symbol: position.symbol,
      profit: profit,
      percentage: profitPercent,
      message: `🚀 High profit on ${position.symbol}: ${profitPercent.toFixed(2)}%`
    });
  }
}

return alerts.map(alert => ({ json: alert }));
```

---

### Use Case 3: Dollar-Cost Averaging (DCA)

Automatically invest a fixed amount at regular intervals.

**Workflow:**
```
Schedule Trigger → Get Balance → Create Market Buy → Log Trade
```

**Schedule Trigger:**
- Run every day at 9:00 AM
- Or every Monday at market open

**Create Market Buy:**
```json
{
  "method": "POST",
  "url": "http://your-bot-domain:3000/api/trades",
  "body": {
    "symbol": "BTCUSDT",
    "side": "buy",
    "amount": 0.001,
    "type": "market"
  }
}
```

---

### Use Case 4: Stop-Loss Management

Monitor positions and automatically set or adjust stop-losses.

**Workflow:**
```
Schedule Trigger → Get Positions → Calculate Stop-Loss → Update Trades
```

**Calculate Stop-Loss (Function Node):**
```javascript
const positions = $input.item.json.data;
const updates = [];

for (const position of positions) {
  const stopLossPercent = 0.05; // 5% stop-loss
  const stopPrice = position.entryPrice * (1 - stopLossPercent);
  
  updates.push({
    positionId: position.id,
    stopLoss: stopPrice
  });
}

return updates.map(update => ({ json: update }));
```

---

### Use Case 5: Market Data Analysis

Collect market data and analyze trends.

**Workflow:**
```
Schedule Trigger → Get Symbols → Analyze Data → Store Results → Alert on Signals
```

**Get Symbols:**
```json
{
  "method": "GET",
  "url": "http://your-bot-domain:3000/api/symbols"
}
```

---

## Complete Example Workflow

Here's a complete n8n workflow JSON for automated trading based on price changes:

```json
{
  "name": "Crypto Auto-Trader",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 15
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "http://your-bot-domain:3000/api/symbols/BTCUSDT",
        "options": {}
      },
      "name": "Get BTC Price",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "const symbol = $input.item.json.data;\nconst priceChange = parseFloat(symbol.priceChangePercent);\n\nif (priceChange > 2) {\n  return [{ json: { action: 'buy', reason: 'Price up 2%' } }];\n} else if (priceChange < -2) {\n  return [{ json: { action: 'sell', reason: 'Price down 2%' } }];\n}\n\nreturn [];"
      },
      "name": "Analyze Price",
      "type": "n8n-nodes-base.function",
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "http://your-bot-domain:3000/api/trades",
        "method": "POST",
        "bodyParameters": {
          "parameters": [
            {
              "name": "symbol",
              "value": "BTCUSDT"
            },
            {
              "name": "side",
              "value": "={{ $json.action }}"
            },
            {
              "name": "amount",
              "value": "0.001"
            },
            {
              "name": "type",
              "value": "market"
            }
          ]
        },
        "options": {}
      },
      "name": "Execute Trade",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Get BTC Price",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get BTC Price": {
      "main": [
        [
          {
            "node": "Analyze Price",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analyze Price": {
      "main": [
        [
          {
            "node": "Execute Trade",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## API Endpoints for n8n

### Most Used Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/trades` | GET | List trades |
| `/api/trades` | POST | Create trade |
| `/api/trades/:id` | DELETE | Cancel trade |
| `/api/symbols` | GET | Get all symbols |
| `/api/symbols/:symbol` | GET | Get symbol details |
| `/api/symbols/ticks/:symbol` | GET | Get real-time tick data |
| `/api/account/assets` | GET | Get balances |
| `/api/positions` | GET | Get positions |

For complete API documentation, see [API Reference](./api-reference.md).

## Error Handling

### Handle API Errors in n8n

Add an error workflow to handle failed requests:

```javascript
// In Error Trigger node
const error = $input.item.json;

// Log error
console.error('Trading error:', error);

// Send notification
return [{
  json: {
    subject: 'Trading Bot Error',
    message: `Error: ${error.error}\nDetails: ${error.message}`,
    timestamp: new Date().toISOString()
  }
}];
```

### Retry Logic

Configure HTTP Request node retry settings:
- **Max Retries**: 3
- **Retry On**: 5xx errors
- **Retry Wait**: 1000ms

## Best Practices

1. **Test with Small Amounts**: Always test workflows with minimal trade amounts first
2. **Use Conditional Logic**: Add checks to prevent duplicate trades
3. **Set Up Alerts**: Configure notifications for important events
4. **Monitor Workflows**: Regularly check execution logs
5. **Rate Limiting**: Be mindful of API rate limits
6. **Error Handling**: Always include error handling nodes
7. **Secure Credentials**: Use n8n's credential system for sensitive data
8. **Version Control**: Export and backup your workflows

## Security Considerations

1. **Domain Whitelist**: Always configure the domain whitelist
2. **HTTPS**: Use HTTPS for production deployments
3. **Network Security**: Ensure secure network connection between n8n and bot
4. **Access Control**: Limit who can modify workflows
5. **Audit Logs**: Enable logging for security events

## Troubleshooting

### Common Issues

**Domain Not Whitelisted:**
```json
{
  "success": false,
  "error": "Access forbidden",
  "message": "Domain not whitelisted"
}
```
**Solution**: Add your n8n domain to `ALLOWED_DOMAINS`

**Connection Timeout:**
- Check bot is running: `curl http://your-bot-domain:3000/api/health`
- Verify network connectivity
- Check firewall rules

**Invalid Response:**
- Verify API endpoint URL
- Check request body format
- Review API documentation

## Advanced Workflows

### Multi-Exchange Arbitrage
Monitor prices across exchanges and execute arbitrage trades.

### Sentiment Analysis Trading
Integrate with sentiment analysis APIs to trade based on market sentiment.

### Technical Indicator Based Trading
Use n8n with technical analysis libraries to create indicator-based strategies.

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [API Reference](./api-reference.md)
- [Bot Commands](./bot-commands.md)
- [Setup Guide](./setup.md)

## Support

For n8n integration issues:
1. Check n8n execution logs
2. Verify bot API is accessible
3. Test endpoints with curl/Postman
4. Review domain whitelist configuration
5. Check network connectivity

---

**⚠️ Risk Disclaimer**: Automated trading carries significant risk. Always test thoroughly with small amounts before using in production. Never risk more than you can afford to lose.
