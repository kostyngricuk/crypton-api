# Deployment Guide

This document provides instructions for deploying the Crypton Telegram Bot in various environments.

## Prerequisites

Before deploying, ensure you have:
- Node.js 18.0.0 or higher installed
- All environment variables configured
- Telegram bot token obtained
- Crypto API credentials ready
- Domain whitelist configured

## Development Deployment

### Local Development

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run in development mode:**
   ```bash
   yarn dev
   ```

The server will start with hot-reload enabled at `http://localhost:3000`.

---

## Production Deployment

### Standard Node.js Deployment

1. **Build the project:**
   ```bash
   yarn build
   ```

2. **Start the server:**
   ```bash
   yarn start
   ```

3. **Use a process manager (recommended):**
   
   **PM2:**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start dist/index.js --name crypton-bot
   
   # Save PM2 configuration
   pm2 save
   
   # Set up auto-restart on system reboot
   pm2 startup
   ```

---

### Docker Deployment

1. **Create a Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   
   # Set working directory
   WORKDIR /app
   
   # Copy package files
   COPY package.json yarn.lock ./
   
   # Install dependencies
   RUN yarn install --frozen-lockfile --production
   
   # Copy source code
   COPY . .
   
   # Build TypeScript
   RUN yarn build
   
   # Expose port
   EXPOSE 3000
   
   # Start application
   CMD ["yarn", "start"]
   ```

2. **Build Docker image:**
   ```bash
   docker build -t crypton-bot .
   ```

3. **Run container:**
   ```bash
   docker run -d \
     --name crypton-bot \
     -p 3000:3000 \
     --env-file .env \
     crypton-bot
   ```

4. **Using Docker Compose:**
   
   Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   
   services:
     crypton-bot:
       build: .
       container_name: crypton-bot
       ports:
         - "3000:3000"
       env_file:
         - .env
       restart: unless-stopped
       volumes:
         - ./logs:/app/logs
   ```
   
   Run with:
   ```bash
   docker-compose up -d
   ```

---

### Netlify Deployment

For serverless deployment on Netlify, see the detailed [Netlify Deployment Guide](./netlify-deployment.md).

**Environment Variables Required on Netlify:**
- `TELEGRAM_BOT_TOKEN`
- `WEB_API_HOST`, `WEB_API_ID`, `WEB_API_KEY`, `WEB_API_SECRET`
- `BEARER_TOKENS` - **Important**: Use strong, randomly generated tokens in production
  ```bash
  # Generate with: openssl rand -base64 32
  ```
- `ALLOWED_DOMAINS`
- `TRUST_PROXY=true`
- `LOG_SECURITY_EVENTS=true`
- `NODE_ENV=production`

**Quick steps:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables
netlify env:set BEARER_TOKENS "your-production-token-here"

# Deploy
netlify deploy --prod
```

---

### VPS/Cloud Server Deployment

#### DigitalOcean, AWS EC2, Linode, etc.

1. **Connect to your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Yarn:**
   ```bash
   npm install -g yarn
   ```

4. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd crypton-tg-bot
   yarn install
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Build and start:**
   ```bash
   yarn build
   pm2 start dist/index.js --name crypton-bot
   ```

6. **Set up Nginx reverse proxy (optional):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Environment Configuration

Ensure these critical environment variables are set:

```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Crypto API
WEB_API_HOST=cryptottlivewebapi.free2ex.net:8443
WEB_API_ID=your_api_id
WEB_API_KEY=your_api_key
WEB_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=production

# Security
ALLOWED_DOMAINS=localhost,your-domain.com
TRUST_PROXY=true
LOG_SECURITY_EVENTS=true
```

See [Configuration Guide](./setup.md#environment-variables) for complete details.

---

## Health Checks

After deployment, verify the application is running:

1. **Health endpoint:**
   ```bash
   curl http://your-domain.com/api/health
   ```

2. **Check bot status:**
   - Send `/status` to your Telegram bot
   - Verify response

3. **Monitor logs:**
   ```bash
   # PM2
   pm2 logs crypton-bot
   
   # Docker
   docker logs crypton-bot
   ```

---

## SSL/HTTPS Setup

For production, always use HTTPS:

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View status
pm2 status

# Monitor resources
pm2 monit

# View logs
pm2 logs crypton-bot

# Restart
pm2 restart crypton-bot
```

### Docker Monitoring

```bash
# View logs
docker logs -f crypton-bot

# View resource usage
docker stats crypton-bot

# Restart container
docker restart crypton-bot
```

---

## Backup & Recovery

### Backup Configuration

```bash
# Backup environment variables
cp .env .env.backup

# Backup PM2 configuration
pm2 save
```

### Recovery Steps

1. Restore environment variables
2. Reinstall dependencies: `yarn install`
3. Rebuild: `yarn build`
4. Restart application

---

## Troubleshooting

### Common Issues

**Bot not responding:**
- Check bot token is correct
- Verify API credentials
- Check logs for errors

**API connection issues:**
- Verify domain whitelist includes your domain
- Check network connectivity
- Verify crypto API credentials

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Build completed successfully
- [ ] Process manager configured (PM2)
- [ ] SSL/HTTPS enabled
- [ ] Domain whitelist configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Health checks passing
- [ ] Bot responding to commands
- [ ] API endpoints accessible

---

## Security Best Practices

1. **Never commit `.env` file**
2. **Use strong API credentials**
3. **Enable HTTPS in production**
4. **Configure firewall rules**
5. **Regularly update dependencies**
6. **Monitor logs for suspicious activity**
7. **Use domain whitelist**
8. **Enable security logging**

See [Security Guide](./security.md) for more details.

---

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test API connectivity
4. Review [Setup Guide](./setup.md)
5. Check [API Reference](./api-reference.md)
