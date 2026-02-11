# Framework Architecture Guide

## Overview

The framework provides a layered architecture for building DDD applications with clear separation of concerns.

## Architecture Layers

```
AbstractBase (common infrastructure)
├── AbstractController (controller infrastructure)
│   └── AbstractCrudController (CRUD controllers)
├── AbstractService (service infrastructure)
│   └── AbstractCrudService (CRUD services)
├── AbstractRepository (repository infrastructure)
│   └── AbstractCrudMongoRepository (MongoDB CRUD repositories)
└── AbstractMapper (mapper infrastructure)
    └── AbstractCrudMapper (CRUD mappers)

AbstractModule (DI container binding)
```

## Base Layer: AbstractBase

**Purpose**: Provides common infrastructure for all framework components.

**Features**:

- Logger with stereotype context (lazy initialization)
- Shared across all abstractions

**Usage**: Extended by all base abstractions (Controller, Service, Repository, Mapper).

```typescript
import { AbstractBase } from 'koa-inversify-framework/abstract';

export class MyCustomService extends AbstractBase {
  // Inherits: this.log

  async myMethod() {
    this.log.debug('Doing something');
    // ...
  }
}
```

## Controller Layer

### AbstractController

**Purpose**: Base class for all controllers (CRUD and custom).

**Features**:

- Logger (inherited from AbstractBase)
- ExecutionContext access
- Multi-tenant validation
- Controller options

**Usage**: For custom controllers (non-CRUD).

```typescript
import { AbstractController } from 'koa-inversify-framework/abstract';
import { Controller } from 'koa-inversify-framework/stereotype';
import { Post } from 'koa-inversify-framework/decorator';
import { Context } from 'koa';

export const AuthenticationControllerSymbol = Symbol.for(
  'AuthenticationController'
);

@Controller(AuthenticationControllerSymbol, {
  basePath: '/api/realm/:tenantId/auth',
  multiTenant: true,
})
export class AuthenticationController extends AbstractController {
  // Inherits: log, executionContext, validateMultiTenantSetup()

  @Post('/login')
  async login(ctx: Context): Promise<void> {
    this.validateMultiTenantSetup(ctx);
    this.log.debug('Login attempt');
    // Custom login logic
  }
}
```

### AbstractCrudController

**Purpose**: Base class for CRUD controllers.

**Features**:

- All AbstractController features
- Service and Mapper injection
- CRUD methods (create, findById, update, delete, findAllPaginated)

**Usage**: For standard CRUD controllers.

```typescript
import { AbstractCrudController } from 'koa-inversify-framework/abstract';
import { Controller } from 'koa-inversify-framework/stereotype';
import { Get, Post, Put, Delete } from 'koa-inversify-framework/decorator';
import { Context } from 'koa';

@Controller(SampleControllerSymbol, {
  basePath: '/api/realm/:tenantId/samples',
  multiTenant: true,
})
export class SampleController extends AbstractCrudController<
  SampleSchema,
  SampleDtoTypes
> {
  constructor(
    @inject(SampleServiceSymbol) protected service: SampleService,
    @inject(SampleMapperSymbol) protected mapper: SampleMapper
  ) {
    super();
  }

  @Post('/')
  async create(ctx: Context): Promise<void> {
    return super.create(ctx);
  }

  // ... other CRUD methods
}
```

## Service Layer

### AbstractService

**Purpose**: Base class for all services (CRUD and custom).

**Features**:

- Logger (inherited from AbstractBase)
- Service options (multiTenant, etc)

**Usage**: For custom services (non-CRUD).

```typescript
import { AbstractService } from 'koa-inversify-framework/abstract';
import { Service } from 'koa-inversify-framework/stereotype';
import { inject } from 'inversify';

export const AuthenticationServiceSymbol = Symbol.for('AuthenticationService');

@Service(AuthenticationServiceSymbol, { multiTenant: true })
export class AuthenticationService extends AbstractService {
  // Inherits: log, getOptions()

  @inject(AccountServiceSymbol) private accountService!: AccountService;
  @inject(JwtServiceSymbol) private jwtService!: JwtService;

  async login(email: string, password: string) {
    this.log.debug({ email }, 'Login attempt');
    // Custom login logic
  }

  async refresh(refreshToken: string) {
    this.log.debug('Refreshing token');
    // Custom refresh logic
  }
}
```

### AbstractCrudService

**Purpose**: Base class for CRUD services.

**Features**:

- All AbstractService features
- Repository injection
- CRUD methods (create, findById, update, delete, etc)
- Abstract methods: buildCreateDataFromDto(), buildUpdate()

**Usage**: For standard CRUD services.

```typescript
import { AbstractCrudService } from 'koa-inversify-framework/abstract';
import { Service } from 'koa-inversify-framework/stereotype';
import { CreateInput } from 'koa-inversify-framework/common';

@Service(SampleServiceSymbol, { multiTenant: true })
export class SampleService extends AbstractCrudService<
  SampleSchema,
  SampleDtoTypes
> {
  @inject(SampleRepositorySymbol) protected repository!: SampleRepository;

  protected buildCreateDataFromDto(
    dto: SampleDtoTypes['CreateRequestDto']
  ): CreateInput<SampleSchema> {
    return {
      name: dto.name,
      email: dto.email,
      isActive: true,
    };
  }

  protected buildUpdate(
    entity: SampleEntity,
    dto: SampleDtoTypes['UpdateRequestDto']
  ): SampleEntity {
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    return entity;
  }
}
```

## Repository Layer

### AbstractRepository

**Purpose**: Base class for all repositories (CRUD and custom).

**Features**:

- Logger (inherited from AbstractBase)
- Repository options (multiTenant, etc)

**Usage**: For custom repositories (non-CRUD).

```typescript
import { AbstractRepository } from 'koa-inversify-framework/abstract';
import { Repository } from 'koa-inversify-framework/stereotype';

export const CustomRepositorySymbol = Symbol.for('CustomRepository');

@Repository(CustomRepositorySymbol, { multiTenant: true })
export class CustomRepository extends AbstractRepository {
  // Inherits: log, getOptions()

  async customQuery() {
    this.log.debug('Executing custom query');
    // Custom repository logic
  }
}
```

### AbstractCrudMongoRepository

**Purpose**: Base class for MongoDB CRUD repositories.

**Features**:

- All AbstractRepository features
- MongoDB connection management
- Multi-tenant database resolution
- CRUD methods (create, findById, update, delete, etc)

**Usage**: For standard MongoDB CRUD repositories.

```typescript
import { AbstractCrudMongoRepository } from 'koa-inversify-framework/abstract';
import { Repository } from 'koa-inversify-framework/stereotype';

@Repository(SampleRepositorySymbol, { multiTenant: true })
export class SampleRepository extends AbstractCrudMongoRepository<SampleSchema> {
  constructor() {
    super(sampleSchema, 'samples');
  }

  async findByEmail(email: string): Promise<SampleEntity | null> {
    return this.findOne({ email: email });
  }
}
```

## Mapper Layer

### AbstractMapper

**Purpose**: Base class for all mappers (CRUD and custom).

**Features**:

- Logger (inherited from AbstractBase)

**Usage**: For custom mappers (non-CRUD).

```typescript
import { AbstractMapper } from 'koa-inversify-framework/abstract';
import { Mapper } from 'koa-inversify-framework/stereotype';

export const CustomMapperSymbol = Symbol.for('CustomMapper');

@Mapper(CustomMapperSymbol)
export class CustomMapper extends AbstractMapper {
  // Inherits: log

  toCustomDto(data: any) {
    this.log.debug('Mapping to custom DTO');
    // Custom mapping logic
  }
}
```

### AbstractCrudMapper

**Purpose**: Base class for CRUD mappers.

**Features**:

- All AbstractMapper features
- Zod schema validation
- DTO transformation methods (toCreateResponseDto, toUpdateResponseDto, etc)

**Usage**: For standard CRUD mappers.

```typescript
import {
  AbstractCrudMapper,
  MapperSchemas,
} from 'koa-inversify-framework/abstract';
import { Mapper } from 'koa-inversify-framework/stereotype';

@Mapper(SampleMapperSymbol)
export class SampleMapper extends AbstractCrudMapper<
  SampleSchema,
  SampleDtoTypes
> {
  constructor() {
    const schemas: MapperSchemas<SampleDtoTypes> = {
      createResponseSchema: sampleResponseSchema,
      findByIdResponseSchema: sampleResponseSchema,
      findOneResponseSchema: sampleResponseSchema,
      updateResponseSchema: sampleResponseSchema,
      deleteResponseSchema: sampleResponseSchema,
      paginatedItemSchema: sampleResponseSchema,
    };
    super(schemas);
  }
}
```

## When to Use Each Layer

### Use AbstractCrud\* (CRUD layer)

- Standard CRUD operations
- Entity-based domain models
- REST API endpoints
- Examples: Account, Role, Group, Policy

### Use Abstract\* (Base layer)

- Custom business logic
- Non-CRUD operations
- Utility services
- Examples: Authentication, JWT, Email, Notification

## Migration Guide

### From Old to New Architecture

**Old (deprecated)**:

```typescript
import { AbstractService } from 'koa-inversify-framework/abstract';

export class MyService extends AbstractService<Schema, DtoTypes> {
  // CRUD service
}
```

**New (recommended)**:

```typescript
import { AbstractCrudService } from 'koa-inversify-framework/abstract';

export class MyService extends AbstractCrudService<Schema, DtoTypes> {
  // CRUD service
}
```

**Custom Service (new)**:

```typescript
import { AbstractService } from 'koa-inversify-framework/abstract';

export class AuthService extends AbstractService {
  // Custom service - no CRUD
}
```

## Benefits

1. **Clear Separation**: CRUD vs Custom logic
2. **Code Reuse**: Common infrastructure in base classes
3. **Flexibility**: Choose the right abstraction level
4. **Maintainability**: Changes in one place affect all
5. **Type Safety**: Full TypeScript support
6. **Testability**: Easy to mock and test

## Best Practices

1. **Use AbstractCrud\* for standard CRUD**: Don't reinvent the wheel
2. **Use Abstract\* for custom logic**: Keep it simple
3. **Extend AbstractBase for utilities**: Minimal overhead
4. **Follow naming conventions**: `[Name]Symbol = Symbol.for('Name')`
5. **Inject dependencies**: Use `@inject(Symbol)` in constructors
6. **Use decorators**: `@Service`, `@Repository`, `@Controller`, `@Mapper`
7. **Log appropriately**: Use `this.log` for debugging and monitoring
