# Koa Inversify Framework

A lightweight, production-ready framework for building scalable Koa applications with Inversify dependency injection, OpenAPI documentation, and built-in observability.

## Features

- 🏗️ **Domain-Driven Design** - Base abstractions for building DDD applications
- 💉 **Dependency Injection** - Inversify integration with decorators
- 🗄️ **MongoDB Support** - Repository pattern with Mongoose ODM
- ✅ **Validation** - Request/response validation with Zod
- 📊 **Observability** - OpenTelemetry tracing and structured logging
- 🔐 **Multi-tenant** - Built-in execution context and tenant isolation
- 📚 **OpenAPI** - Automatic API documentation with Swagger UI
- ⚡ **Type-Safe** - Full TypeScript support with strict typing

## Installation

```bash
npm install koa-inversify-framework
```

## Quick Start

```typescript
import { Framework } from 'koa-inversify-framework';
import { AbstractController } from 'koa-inversify-framework/abstract';
import { Controller, Get } from 'koa-inversify-framework/stereotype';

@Controller('/api/users')
class UserController extends AbstractController {
  @Get('/:id')
  async getUser(ctx) {
    ctx.body = { id: ctx.params.id, name: 'John Doe' };
  }
}

const framework = new Framework();
framework.registerModule(UserController);
await framework.init();
await framework.start();
```

## Architecture

### Core Concepts

- **Controllers** - HTTP request handlers
- **Services** - Business logic orchestration
- **Repositories** - Data access layer
- **Mappers** - Entity ↔ DTO transformation
- **Modules** - DI container binding

### Directory Structure

```
src/
├── abstract/          # Base classes
├── stereotype/        # DI decorators
├── infrastructure/    # Technical providers
├── common/           # Shared types and DTOs
└── error/            # Custom errors
```

## Documentation

- [Usage Guide](./.doc/usage-guide.md) - Complete example of building a DDD module
- [Contributing](./CONTRIBUTING.md) - How to contribute
- [Security Policy](./SECURITY.md) - Security guidelines
- [Changelog](./CHANGELOG.md) - Version history

## Development

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Watch mode
npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Watch mode
npm test -- --watch
```

## License

Proprietary - See [LICENSE](./LICENSE) for details.

## Support

For issues and questions, please open a GitHub issue.
