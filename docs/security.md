# Security Guide

This document outlines the security features and best practices for the Crypton Telegram Bot.

## Security Features

### 1. Bearer Token Authentication

The API uses Bearer token authentication to secure all endpoints except health checks.

**How It Works:**
- All API requests must include a valid Bearer token in the Authorization header
- Tokens are validated using constant-time comparison to prevent timing attacks
- Multiple tokens can be configured for different API clients
- Health check endpoints are exempted to allow monitoring without authentication

**Configuration:**
```bash
# Generate secure tokens using: openssl rand -base64 32
BEARER_TOKENS=token1,token2,token3
```

**Usage Example:**
```bash
# Making an authenticated request
curl -H "Authorization: Bearer your-token-here" http://localhost:3001/api/trades
```

**Supported Endpoints:**
- Protected: `/api/trades`, `/api/symbols`, `/api/account`, `/api/positions`, `/api/server`
- Exempted: `/api/health`

**Security Features:**
- Constant-time token comparison prevents timing attacks
- Case-insensitive Bearer scheme handling
- Automatic whitespace trimming
- Failed authentication logging for security monitoring
- Standardized error responses that don't expose system internals

**Token Rotation:**
To rotate tokens without downtime:
1. Add new token to BEARER_TOKENS: `BEARER_TOKENS=old-token,new-token`
2. Update clients to use new token
3. Remove old token once all clients are updated: `BEARER_TOKENS=new-token`

### 2. Domain Whitelist

The bot implements domain-based access control to restrict API access to approved domains only.

**How It Works:**
- Validates the origin/referer header of incoming requests
- Compares against configured allowed domains
- Blocks requests from unauthorized domains

**Configuration:**
```bash
ALLOWED_DOMAINS=localhost,your-domain.com,n8n.cloud
```

**Supported Formats:**
```
# Specific domains
localhost
example.com
api.example.com

# With port
localhost:3000

# Multiple domains (comma-separated)
localhost,example.com,api.example.com
```

**IP Address Handling:**
```bash
# Enable proxy trust for accurate IP detection
TRUST_PROXY=true

# The bot will correctly identify client IPs behind proxies
```

### 2. API Authentication

**Crypto API Credentials:**
- API ID, Key, and Secret are stored securely in environment variables
- Never exposed in logs or error messages
- Transmitted securely to the trading API

**Environment Variable Security:**
```bash
# Never commit .env file to version control
# Add to .gitignore
echo ".env" >> .gitignore

# Use environment variable management in production
# - Netlify: Site settings → Environment variables
# - Docker: --env-file flag or docker-compose
# - VPS: systemd service files or PM2 ecosystem
```

### 3. Input Validation

All user inputs and API requests are validated:

**Telegram Bot:**
- Command parameter validation
- Type checking for numeric values
- Symbol name validation
- Trade ID validation

**REST API:**
- Request body validation
- Query parameter validation
- Path parameter validation
- Type coercion and sanitization

### 4. Error Boundaries

**Secure Error Handling:**
- Sensitive information never exposed in error messages
- API credentials masked in logs
- Stack traces disabled in production
- Detailed errors only in development mode

**Error Response Format:**
```json
{
  "success": false,
  "error": "User-friendly error message",
  "message": "Additional context (non-sensitive)"
}
```

### 5. Environment Isolation

**Development vs Production:**
```bash
# Development
NODE_ENV=development
# - Detailed error messages
# - Stack traces enabled
# - Debug logging

# Production
NODE_ENV=production
# - Minimal error details
# - Security-focused logging
# - Performance optimized
```

### 6. Security Logging



## Best Practices

### 1. Credential Management

**DO:**
- ✅ Use environment variables for all secrets
- ✅ Rotate API credentials regularly
- ✅ Use different credentials for dev/staging/production
- ✅ Implement credential rotation strategy
- ✅ Use secrets management services (AWS Secrets Manager, HashiCorp Vault)

**DON'T:**
- ❌ Hardcode credentials in source code
- ❌ Commit .env files to version control
- ❌ Share credentials via insecure channels
- ❌ Use the same credentials across environments
- ❌ Store credentials in plain text files on servers

### 2. Network Security

**Firewall Configuration:**
```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Deny all other incoming traffic
ufw default deny incoming
ufw default allow outgoing
```

**Rate Limiting:**
Consider implementing rate limiting for API endpoints:
```typescript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 3. HTTPS/SSL

**Always Use HTTPS in Production:**

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 4. Dependency Security

**Regular Updates:**
```bash
# Check for vulnerabilities
yarn audit

# Fix vulnerabilities
yarn audit fix

# Update dependencies
yarn upgrade-interactive --latest
```

**Automated Scanning:**
- Enable Dependabot on GitHub
- Use Snyk for continuous monitoring
- Set up automated security alerts

### 5. Access Control

**Telegram Bot:**
- Consider implementing user whitelist for sensitive commands
- Add admin-only commands for critical operations
- Implement command rate limiting

```typescript
// Example: Admin user check
const ADMIN_USERS = process.env.ADMIN_USER_IDS?.split(',') || [];

function isAdmin(userId: number): boolean {
  return ADMIN_USERS.includes(userId.toString());
}

// Use in command handlers
bot.command('admin-only', async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    return ctx.reply('Unauthorized: Admin access required');
  }
  // Admin operation
});
```

### 6. Monitoring & Alerts

**Set Up Monitoring:**
- Track failed authentication attempts
- Monitor unusual trading patterns
- Alert on suspicious API usage

**Alert Thresholds:**
```typescript
// Example: Alert on multiple failed requests
let failedAttempts = 0;

function checkSecurity(domain: string) {
  if (!isAllowed(domain)) {
    failedAttempts++;
    if (failedAttempts > 10) {
      sendAlert('High number of unauthorized access attempts');
    }
  }
}
```

### 7. Data Protection

**Sensitive Data:**
- Never log API keys or secrets
- Mask sensitive data in error messages
- Sanitize user inputs
- Implement data retention policies

```typescript
// Example: Mask sensitive data in logs
function maskApiKey(key: string): string {
  if (key.length <= 8) return '***';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

console.log(`Using API Key: ${maskApiKey(apiKey)}`);
```

### 8. Database Security (If Applicable)

If you add a database:
- Use parameterized queries (prevent SQL injection)
- Implement proper access controls
- Encrypt sensitive data at rest
- Regular backups with encryption
- Separate read/write credentials

## Security Checklist

### Development
- [ ] .env file in .gitignore
- [ ] No hardcoded credentials
- [ ] Input validation implemented
- [ ] Error handling in place
- [ ] Security logging configured

### Deployment
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Domain whitelist set
- [ ] Environment variables secured
- [ ] Monitoring enabled
- [ ] Backups configured

### Maintenance
- [ ] Regular dependency updates
- [ ] Security audit logs reviewed
- [ ] Credentials rotated
- [ ] Access logs monitored
- [ ] Incident response plan ready

## Incident Response

### If You Suspect a Security Breach:

1. **Immediate Actions:**
   - Rotate all API credentials immediately
   - Change Telegram bot token
   - Review access logs
   - Identify the scope of the breach

2. **Investigation:**
   - Check security logs for suspicious activity
   - Review recent code changes
   - Verify domain whitelist configuration
   - Check for unauthorized API access

3. **Recovery:**
   - Update all credentials
   - Deploy security patches
   - Notify affected users if necessary
   - Document the incident

4. **Prevention:**
   - Implement additional security measures
   - Update security policies
   - Train team on security best practices
   - Conduct security review

## Security Auditing

**Regular Security Reviews:**
```bash
# Check for secrets in code
git secrets --scan

# Audit dependencies
yarn audit

# Check for common vulnerabilities
npm install -g snyk
snyk test

# Review security logs
grep "SECURITY" logs/*.log
```

## Compliance

Depending on your jurisdiction and use case:
- Understand data protection regulations (GDPR, CCPA)
- Implement required data handling practices
- Maintain audit trails
- Ensure user privacy protection
- Document security practices

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Telegram Bot Security](https://core.telegram.org/bots/security)

## Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Contact the maintainer directly
3. Provide detailed information about the vulnerability
4. Wait for acknowledgment before public disclosure

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential to maintain a secure application.
