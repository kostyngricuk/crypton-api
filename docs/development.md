# Development Guide

This document provides information for developers working on the Crypton Telegram Bot.

## Development Environment Setup

### Prerequisites

- Node.js 18.0.0 or higher
- Yarn package manager
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd crypton-tg-bot
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your development credentials
   ```

   **Required Environment Variables:**
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from BotFather
   - `WEB_API_HOST` - Trading API host
   - `WEB_API_ID`, `WEB_API_KEY`, `WEB_API_SECRET` - Trading API credentials
   - `BEARER_TOKENS` - Comma-separated list of API authentication tokens
     ```bash
     # Generate secure tokens with: openssl rand -base64 32
     BEARER_TOKENS=token1,token2
     ```
   - `ALLOWED_DOMAINS` - Comma-separated list of allowed domains for CORS
   - `PORT` - Server port (default: 3001)

4. **Start development server:**
   ```bash
   yarn dev
   ```

## Project Structure

```
crypton-tg-bot/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── index.ts            # Main entry point
│   ├── server.ts           # Server setup
│   ├── bot/
│   │   └── telegramBot.ts  # Telegram bot implementation
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── middleware/
│   │   ├── domainWhitelist.ts  # Domain whitelist middleware
│   │   └── errorHandler.ts     # Error handling middleware
│   ├── routes/
│   │   ├── account.ts      # Account endpoints
│   │   ├── health.ts       # Health check endpoints
│   │   ├── positions.ts    # Position endpoints
│   │   ├── serverInfo.ts   # Server info endpoints
│   │   ├── symbols.ts      # Symbol endpoints
│   │   └── trades.ts       # Trade endpoints
│   ├── services/
│   │   └── cryptoApi.ts    # Crypto API client
│   ├── types/
│   │   ├── api.ts          # API type definitions
│   │   └── middleware.ts   # Middleware type definitions
│   └── utils/              # Utility functions
├── tests/
│   ├── setup.ts            # Test setup
│   ├── integration/        # Integration tests
│   └── unit/               # Unit tests
├── docs/                   # Documentation
├── netlify/
│   └── functions/          # Netlify serverless functions
└── public/                 # Static files
```

## Available Scripts

### Development

```bash
# Start development server with hot reload
yarn dev

# Type checking
yarn type-check

# Lint code
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Format check (CI)
yarn format:check
```

### Building

```bash
# Build for production
yarn build

# Clean build artifacts
yarn clean
```

### Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test path/to/test.ts
```

### Production

```bash
# Start production server
yarn start
```

## Development Workflow

### 1. Code Style

We use **Biome** for linting and formatting:

```bash
# Check code style
yarn lint
yarn format:check

# Auto-fix issues
yarn lint:fix
yarn format
```

**VS Code Integration:**
Install the Biome extension for automatic formatting on save.

### 2. Type Safety

Always use TypeScript and avoid `any` types:

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface DataType {
  value: string;
}

function processData(data: DataType): string {
  return data.value;
}
```

### 3. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
```

**Commit Message Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(bot): add balance command
fix(api): correct symbol endpoint response
docs(readme): update installation instructions
```

### 4. Testing

Write tests for new features and bug fixes:

```typescript
// Example: Unit test
describe('domainWhitelist middleware', () => {
  it('should allow whitelisted domains', async () => {
    const req = mockRequest({ headers: { origin: 'localhost' } });
    const res = mockResponse();
    const next = jest.fn();
    
    await domainWhitelist(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
  
  it('should block non-whitelisted domains', async () => {
    const req = mockRequest({ headers: { origin: 'evil.com' } });
    const res = mockResponse();
    const next = jest.fn();
    
    await domainWhitelist(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### 5. Adding New Features

**Step-by-step process:**

1. **Plan the feature:**
   - Define requirements
   - Design the API/interface
   - Consider security implications

2. **Create types:**
   ```typescript
   // src/types/api.ts
   export interface NewFeatureRequest {
     param1: string;
     param2: number;
   }
   
   export interface NewFeatureResponse {
     success: boolean;
     data: SomeType;
   }
   ```

3. **Implement service layer:**
   ```typescript
   // src/services/cryptoApi.ts
   async newFeatureMethod(params: NewFeatureRequest): Promise<NewFeatureResponse> {
     // Implementation
   }
   ```

4. **Create route handler:**
   ```typescript
   // src/routes/newFeature.ts
   import { Router } from 'express';
   import { cryptoApi } from '../services/cryptoApi';
   
   export const newFeatureRouter = Router();
   
   newFeatureRouter.get('/', async (req, res, next) => {
     try {
       const result = await cryptoApi.newFeatureMethod(req.body);
       res.json(result);
     } catch (error) {
       next(error);
     }
   });
   ```

5. **Register route:**
   ```typescript
   // src/app.ts
   import { newFeatureRouter } from './routes/newFeature';
   app.use('/api/new-feature', newFeatureRouter);
   ```

6. **Add bot command (if applicable):**
   ```typescript
   // src/bot/telegramBot.ts
   bot.command('newfeature', async (ctx) => {
     try {
       const result = await cryptoApi.newFeatureMethod({});
       await ctx.reply(formatResult(result));
     } catch (error) {
       await ctx.reply('Error: ' + error.message);
     }
   });
   ```

7. **Write tests:**
   - Unit tests for service layer
   - Integration tests for routes
   - Bot command tests

8. **Update documentation:**
   - Add to API reference
   - Update bot commands doc
   - Add examples

## API Development

### Creating New Endpoints

Follow this pattern for consistency:

```typescript
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

export const myRouter = Router();

// GET endpoint
myRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const { param } = req.query;
    
    if (!param) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: param'
      });
    }
    
    // Business logic
    const result = await someService.doSomething(param as string);
    
    // Success response
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Let error handler deal with it
  }
});

// POST endpoint
myRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate body
    const { field1, field2 } = req.body;
    
    // Process
    const result = await someService.create({ field1, field2 });
    
    // Success response
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});
```

### Error Handling

Always use the error handling middleware:

```typescript
// In route handlers
try {
  // Your code
} catch (error) {
  next(error); // Pass to error handler
}

// The error handler will format the response appropriately
```

## Debugging

### Using VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Logging

Use console methods appropriately:

```typescript
// Development
console.log('Debug info:', data);

// Important info
console.info('Server started on port:', port);

// Warnings
console.warn('Deprecated feature used');

// Errors
console.error('Failed to process:', error);

// Security events

```

## Performance Optimization

### Tips

1. **Use async/await properly:**
   ```typescript
   // ❌ Sequential (slow)
   const data1 = await fetchData1();
   const data2 = await fetchData2();
   
   // ✅ Parallel (fast)
   const [data1, data2] = await Promise.all([
     fetchData1(),
     fetchData2()
   ]);
   ```

2. **Cache frequently accessed data:**
   ```typescript
   let symbolsCache: SymbolInfo[] | null = null;
   let cacheTime = 0;
   const CACHE_TTL = 60000; // 1 minute
   
   async function getSymbols() {
     const now = Date.now();
     if (symbolsCache && now - cacheTime < CACHE_TTL) {
       return symbolsCache;
     }
     
     symbolsCache = await cryptoApi.getSymbols();
     cacheTime = now;
     return symbolsCache;
   }
   ```

3. **Implement rate limiting:**
   Use libraries like `express-rate-limit` for API endpoints.

## Troubleshooting

### Common Issues

**TypeScript errors:**
```bash
# Clear build cache
yarn clean
yarn build
```

**Port already in use:**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

## Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [grammY Documentation](https://grammy.dev/)
- [Biome Documentation](https://biomejs.dev/)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [ngrok](https://ngrok.com/) - Local webhook testing

## Contributing

See the main README for contribution guidelines.

## Getting Help

- Check existing documentation
- Review test files for examples
- Ask in project discussions
- Review similar implementations in the codebase

---

Happy coding! 🚀
