# Netlify Deployment Guide

This document provides instructions for deploying the Crypton Telegram Bot to Netlify using serverless functions.

## 🚀 Netlify Functions Overview

The following Netlify functions have been created to handle your application:

### API Functions

1. **`api.mts`** - Main API router with health check endpoint
   - Path: `/api/*`
   - Handles: General API routing and health checks

2. **`account.mts`** - Account information endpoint
   - Path: `/api/account`
   - Handles: Fetching account assets via crypto API

3. **`positions.mts`** - Trading positions endpoint
   - Path: `/api/positions`
   - Handles: Fetching current trading positions

4. **`symbols.mts`** - Trading symbols endpoint
   - Path: `/api/symbols`
   - Handles: Fetching available trading symbols

5. **`trades.mts`** - Trading data endpoint
   - Path: `/api/trades`
   - Handles: Fetching trading history and active trades

6. **`server-info.mts`** - Server information endpoint
   - Path: `/api/server-info`
   - Handles: Fetching crypto API server information

7. **`telegram-webhook.mts`** - Telegram bot webhook
   - Path: `/webhook/telegram`
   - Handles: Processing Telegram bot updates

## 📦 Deployment Steps

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Build the Project

```bash
yarn build
```

### 4. Login to Netlify

```bash
netlify login
```

### 5. Initialize Netlify Site

```bash
netlify init
```

### 6. Set Environment Variables

Set the following environment variables in your Netlify site

### 7. Deploy

```bash
netlify deploy --prod
```

## 🔧 Local Development

To test functions locally:

```bash
yarn dev:netlify
```

This will start the Netlify dev server which emulates the serverless functions environment.

## 🔗 Setting Up Telegram Webhook

After deploying, you'll need to set up the Telegram webhook to point to your Netlify function:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-site-name.netlify.app/webhook/telegram"}'
```

Replace:

- `<YOUR_BOT_TOKEN>` with your actual Telegram bot token
- `your-site-name.netlify.app` with your actual Netlify domain

## 📋 Available Endpoints

After deployment, your API will be available at:

- `https://your-site.netlify.app/api/health` - Health check
- `https://your-site.netlify.app/api/account` - Account information
- `https://your-site.netlify.app/api/positions` - Trading positions
- `https://your-site.netlify.app/api/symbols` - Trading symbols
- `https://your-site.netlify.app/api/trades` - Trading data
- `https://your-site.netlify.app/api/server-info` - Server information
- `https://your-site.netlify.app/webhook/telegram` - Telegram webhook

## 🛠️ Configuration Files

- **`netlify.toml`** - Netlify build and deployment configuration
- **`package.json`** - Updated with Netlify-specific scripts and dependencies
- **`tsconfig.json`** - TypeScript configuration (existing)

## 🔍 Monitoring and Debugging

- Use Netlify's function logs in the dashboard to monitor function execution
- Check the "Functions" tab in your Netlify site dashboard for real-time logs
- Use `netlify functions:invoke function-name` to test functions locally

## 🚨 Important Notes

1. **Environment Variables**: Make sure all required environment variables are set in Netlify
2. **CORS**: Functions include CORS headers for cross-origin requests
3. **Error Handling**: All functions include proper error handling and logging
4. **TypeScript**: Functions use `.mts` extension for modern ES modules with TypeScript
5. **Build Process**: The build process compiles TypeScript and prepares functions for deployment

## 🔄 Continuous Deployment

Once set up, any push to your main branch will automatically trigger a new deployment with the latest code changes.