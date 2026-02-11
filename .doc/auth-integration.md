# Authentication & Authorization Integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Koa Application                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  koa-inversify-framework                              │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Authentication Middleware (Koa Adapter)        │ │ │
│  │  │  - Extract token from headers                   │ │ │
│  │  │  - Extract tenantId from params                 │ │ │
│  │  │  - Call auth-client-js.authenticate()           │ │ │
│  │  │  - Populate ctx.state.user                      │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                          ↓                            │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Authorization Middleware (Koa Adapter)         │ │ │
│  │  │  - Extract accountId from ctx.state.user        │ │ │
│  │  │  - Build action (system:resource:operation)     │ │ │
│  │  │  - Build resource (GRN format)                  │ │ │
│  │  │  - Call auth-client-js.authorize()              │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  .external/auth-client-js (Framework-Agnostic)       │ │
│  │                                                       │ │
│  │  - authenticate(httpClient, idmUrl, request)         │ │
│  │  - authorize(httpClient, idmUrl, request)            │ │
│  │  - Pure JavaScript/TypeScript                        │ │
│  │  - No framework dependencies                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                          ↓ HTTP                             │
└──────────────────────────┼──────────────────────────────────┘
                           ↓
                  ┌────────────────┐
                  │  IDM Backend   │
                  │  (Remote)      │
                  └────────────────┘
```

## Separation of Concerns

### `.external/auth-client-js` (Framework-Agnostic)

**Responsibility**: HTTP client for remote validation

**What it does:**

- Makes HTTP calls to IDM backend
- Handles request/response structure
- Provides TypeScript types
- Includes OpenTelemetry tracing
- Pure JavaScript - no framework coupling

**What it does NOT do:**

- Extract data from Koa Context
- Handle Koa-specific errors
- Manage middleware lifecycle
- Know about decorators

### `koa-inversify-framework` (Koa Adapter)

**Responsibility**: Koa-specific integration layer

**What it does:**

- Extracts data from Koa Context (headers, params, state)
- Calls auth-client-js functions
- Populates ctx.state with results
- Throws Koa-compatible errors
- Integrates with decorators (@Authentication, @Authorize)
- Manages middleware execution order

**What it does NOT do:**

- Implement JWT validation logic
- Implement policy evaluation logic
- Make direct HTTP calls to IDM

## Implementation Plan

### Phase 1: Setup Integration

```typescript
// package.json
{
  "dependencies": {
    "@idm-auth/auth-client": "file:.external/auth-client-js"
  }
}
```

### Phase 2: HTTP Client Configuration

```typescript
// src/infrastructure/auth/httpClient.provider.ts
import { IHttpClient, HttpOptions } from '@idm-auth/auth-client';

export class AuthHttpClient implements IHttpClient {
  constructor(private timeout = 5000) {}

  async post<T>(url: string, data: unknown, options?: HttpOptions): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(url: string, options?: HttpOptions): Promise<T> {
    // Similar implementation
  }
}
```

### Phase 3: Authentication Middleware

```typescript
// src/infrastructure/koa/middleware/authentication.build.middleware.ts
import { authenticate } from '@idm-auth/auth-client';
import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { KoaMiddleware } from './middleware.types';
import { AuthHttpClient } from '@/infrastructure/auth/httpClient.provider';
import { Env, EnvSymbol } from '@/infrastructure/env/env.provider';

export const buildAuthenticationMiddleware = (
  controllerClass: object,
  methodName: string,
  container: Container
): KoaMiddleware | null => {
  const env = container.get<Env>(EnvSymbol);
  const idmUrl = env.get('IDM_URL');
  const application = env.get('APPLICATION_NAME');
  const httpClient = new AuthHttpClient();

  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      ctx.throw(401, 'Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    const tenantId = ctx.params.tenantId;

    if (!tenantId) {
      ctx.throw(400, 'Missing tenantId in route');
    }

    const result = await authenticate(httpClient, idmUrl, {
      application,
      token,
      tenantId,
    });

    if (!result.valid) {
      ctx.throw(401, result.error || 'Authentication failed');
    }

    ctx.state.user = result.payload;
    ctx.state.tenantId = tenantId;

    await next();
  };
};
```

### Phase 4: Authorization Middleware

```typescript
// src/infrastructure/koa/middleware/authorize.build.middleware.ts
import { authorize } from '@idm-auth/auth-client';
import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { KoaMiddleware } from './middleware.types';
import { AuthHttpClient } from '@/infrastructure/auth/httpClient.provider';
import { Env, EnvSymbol } from '@/infrastructure/env/env.provider';
import { getAuthorizeMetadata } from '@/decorator/authorize.decorator';

export const buildAuthorizeMiddleware = (
  controllerClass: object,
  methodName: string,
  container: Container
): KoaMiddleware | null => {
  const metadata = getAuthorizeMetadata(controllerClass, methodName);
  if (!metadata) return null;

  const env = container.get<Env>(EnvSymbol);
  const idmUrl = env.get('IDM_URL');
  const application = env.get('APPLICATION_NAME');
  const httpClient = new AuthHttpClient();

  return async (ctx: Context, next: Next) => {
    const accountId = ctx.state.user?.accountId;
    const tenantId = ctx.state.tenantId;

    if (!accountId || !tenantId) {
      ctx.throw(401, 'User not authenticated');
    }

    // Resolve action template: "iam:accounts:${operation}"
    const action = resolveTemplate(metadata.action, ctx);

    // Resolve resource template: "grn:global:iam::${tenantId}:accounts/${id}"
    const resource = resolveTemplate(metadata.resource, ctx);

    const result = await authorize(httpClient, idmUrl, {
      application,
      accountId,
      tenantId,
      action,
      resource,
    });

    if (!result.allowed) {
      ctx.throw(403, result.error || 'Access denied');
    }

    await next();
  };
};

function resolveTemplate(template: string, ctx: Context): string {
  return template.replace(/\${(\w+)}/g, (_, key) => {
    return ctx.params[key] || ctx.state[key] || '';
  });
}
```

### Phase 5: Decorator Integration

```typescript
// src/decorator/authorize.decorator.ts
export interface AuthorizeMetadata {
  action: string; // Template: "iam:accounts:${operation}"
  resource: string; // Template: "grn:global:iam::${tenantId}:accounts/${id}"
}

export function Authorize(metadata: AuthorizeMetadata) {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata('authorize', metadata, target, propertyKey);
    return descriptor;
  };
}

export function getAuthorizeMetadata(
  target: object,
  propertyKey: string
): AuthorizeMetadata | undefined {
  return Reflect.getMetadata('authorize', target, propertyKey);
}
```

## Usage Example

```typescript
// Controller with authentication and authorization
@Controller({ basePath: '/api/realm/:tenantId/accounts', multiTenant: true })
export class AccountController extends AbstractController<
  AccountSchema,
  AccountDtoTypes
> {
  @Get('/')
  @Authentication()
  @Authorize({
    action: 'iam:accounts:list',
    resource: 'grn:global:iam::${tenantId}:accounts/*',
  })
  async findAll(ctx: Context): Promise<void> {
    // ctx.state.user is populated by authentication middleware
    // Authorization checked before reaching here
    return super.findAllPaginated(ctx);
  }

  @Get('/:id')
  @Authentication()
  @Authorize({
    action: 'iam:accounts:read',
    resource: 'grn:global:iam::${tenantId}:accounts/${id}',
  })
  async findById(ctx: Context): Promise<void> {
    return super.findById(ctx);
  }

  @Put('/:id')
  @Authentication()
  @Authorize({
    action: 'iam:accounts:update',
    resource: 'grn:global:iam::${tenantId}:accounts/${id}',
  })
  async update(ctx: Context): Promise<void> {
    return super.update(ctx);
  }
}
```

## Testing Strategy

### Unit Tests (Mock HTTP Client)

```typescript
describe('buildAuthenticationMiddleware', () => {
  it('should authenticate valid token', async () => {
    const mockHttpClient: IHttpClient = {
      post: vi.fn().mockResolvedValue({
        valid: true,
        payload: { accountId: '123', email: 'test@example.com' },
      }),
      get: vi.fn(),
    };

    const middleware = buildAuthenticationMiddleware(/* ... */);
    const ctx = createMockContext({
      headers: { authorization: 'Bearer valid.token' },
      params: { tenantId: 'tenant-123' },
    });

    await middleware(ctx, async () => {});

    expect(ctx.state.user.accountId).toBe('123');
    expect(ctx.state.tenantId).toBe('tenant-123');
  });
});
```

### Integration Tests (Mock IDM Backend)

```typescript
describe('Authentication Integration', () => {
  it('should authenticate and authorize request', async () => {
    // Mock IDM backend responses
    mockIdmBackend
      .post('/api/realm/tenant-123/auth/validate')
      .reply(200, { valid: true, payload: { accountId: '123' } });

    mockIdmBackend
      .post('/api/realm/tenant-123/authz/evaluate')
      .reply(200, { allowed: true });

    const response = await request(app)
      .get('/api/realm/tenant-123/accounts')
      .set('Authorization', 'Bearer test.token')
      .expect(200);
  });
});
```

## Benefits

### For Framework

- ✅ No authentication/authorization logic to maintain
- ✅ Always up-to-date with IDM rules
- ✅ Simple adapter layer
- ✅ Easy to test (mock IHttpClient)

### For auth-client-js

- ✅ Framework agnostic (works with Koa, Express, Fastify, Lambda)
- ✅ Pure JavaScript/TypeScript
- ✅ Single responsibility
- ✅ Reusable across projects

### For Applications

- ✅ Consistent auth behavior
- ✅ Centralized policy management
- ✅ Simple decorator-based API
- ✅ Type-safe integration
