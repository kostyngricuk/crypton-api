# Crypton Telegram Bot Setup Guide

This guide will help you set up and configure the Crypton Telegram Bot for crypto trading.

## Prerequisites

- Node.js 18.0.0 or higher
- Yarn package manager
- Telegram bot token (from [@BotFather](https://t.me/botfather))
- Access to the crypto trading API

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd crypton-api
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in the `.env` file

## Getting Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat and send `/newbot`
3. Follow the instructions to create your bot
4. Copy the provided token and add it to your `.env` file

## Getting Crypto API Credentials

1. Register for an account at the crypto trading platform
2. Navigate to API settings in your account dashboard
3. Generate new API credentials:
   - API ID
   - API Key
   - API Secret
4. Add these credentials to your `.env` file

⚠️ **Security Warning**: Keep your API credentials secure and never share them publicly.

## Building and Running

### Development Mode
```bash
yarn dev
```

### Production Build
```bash
yarn build
yarn start
```

### Type Checking
```bash
yarn type-check
```

### Linting and Formatting
```bash
yarn lint
yarn lint:fix
yarn format
```

## Testing the Bot

1. Start the bot in development mode:
   ```bash
   yarn dev
   ```

2. Open Telegram and find your bot
3. Send `/start` to begin using the bot
4. Try various commands like:
   - `/status` - Check bot status
   - `/balance` - View account balance
   - `/symbols` - List trading symbols
   - `/help` - Show all available commands

## Domain Whitelist Configuration

The bot includes domain whitelist functionality for security. Configure the `ALLOWED_DOMAINS` environment variable with comma-separated domains that are allowed to access the API:

```env
ALLOWED_DOMAINS=localhost,127.0.0.1,your-n8n-domain.com,api.yourapp.com
```

## API Integration with n8n

The bot exposes REST endpoints that can be used by n8n or other automation tools:

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints
- `GET /health` - Health check
- `GET /trades` - List trades
- `POST /trades` - Create trade
- `GET /trades/:id` - Get trade by ID
- `PUT /trades/:id` - Update trade
- `DELETE /trades/:id` - Cancel trade
- `GET /symbols` - List symbols
- `GET /symbols/:symbol` - Get symbol info
- `GET /account/assets` - List account assets
- `GET /account/assets/:currency` - Get asset by currency
- `GET /positions` - List positions
- `GET /positions/:identifier` - Get position by ID or symbol
- `GET /server/info` - Get server information

## Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Check if `TELEGRAM_BOT_TOKEN` is correct
   - Verify bot is running without errors
   - Check console logs for error messages

2. **API errors:**
   - Verify API credentials are correct
   - Check if API host is accessible
   - Ensure API rate limits are not exceeded

3. **Domain access denied:**
   - Check `ALLOWED_DOMAINS` configuration
   - Ensure requesting domain is in whitelist
   - Verify CORS settings

### Log Analysis

The application provides detailed logging:
- API requests and responses
- Error messages with stack traces
- Bot command executions
- Server status information

### Development Tips

1. Use development mode for debugging:
   ```bash
   yarn dev
   ```

2. Check TypeScript types:
   ```bash
   yarn type-check
   ```

3. Monitor logs for errors and API responses

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Rotate API keys regularly
3. **Domain Whitelist**: Keep the whitelist as restrictive as possible
4. **HTTPS**: Use HTTPS in production environments
5. **Rate Limiting**: Monitor API usage to avoid rate limits

## Support

For technical support or questions:
1. Check the logs for error messages
2. Verify environment configuration
3. Test API connectivity separately
4. Review the [main documentation](../README.md)

## Next Steps

- [API Reference](./api-reference.md)
- [Bot Commands](./bot-commands.md)
- [Deployment Guide](./deployment.md)