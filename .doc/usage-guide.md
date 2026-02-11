# Framework Usage Guide

## Overview

This guide shows how to build a complete DDD module using the framework.
Examples based on `test/fixtures/domain/` implementations.

**For architecture details and layer explanations, see [Architecture Guide](./architecture-guide.md)**

## Module Structure

Each domain module consists of 7 files:

```
src/domain/sample/
├── sample.entity.ts      # Mongoose schema + types
├── sample.dto.ts         # Zod schemas + types
├── sample.repository.ts  # Data access
├── sample.mapper.ts      # Entity ↔ DTO transformation
├── sample.service.ts     # Business logic
├── sample.controller.ts  # HTTP endpoints
└── sample.module.ts      # DI bindings
```

## Multi-Tenant vs Single-Tenant

The framework supports both patterns:

- **Multi-tenant**: Uses `tenantId` in routes, requires `dbName` parameter
- **Single-tenant**: No tenant isolation, uses default database

## 1. Entity (sample.entity.ts)

Define Mongoose schema and types:

```typescript
import { baseEntitySchema } from '@/common/base';
import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

export type Sample = {
  name: string;
  email: string;
  isActive: boolean;
};

export const sampleSchema = new mongoose.Schema<Sample>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
sampleSchema.add(baseEntitySchema);

// Add indexes as needed
sampleSchema.index({ email: 1 }, { unique: true });

export type SampleSchema = typeof sampleSchema;
export type SampleEntity = HydratedDocument<
  InferSchemaType<typeof sampleSchema>
>;
```

## 2. DTO (sample.dto.ts)

Define Zod schemas and DtoTypes:

```typescript
import { DocIdSchema, emailSchema } from '@/common/base';
import { DtoTypes } from '@/common';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const sampleCreateSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
});

export const sampleResponseSchema = z.object({
  _id: DocIdSchema,
  name: z.string(),
  email: emailSchema,
  isActive: z.boolean(),
});

export const sampleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type SampleCreate = z.infer<typeof sampleCreateSchema>;
export type SampleResponse = z.infer<typeof sampleResponseSchema>;
export type SampleUpdate = z.infer<typeof sampleUpdateSchema>;

export interface SampleDtoTypes extends DtoTypes {
  CreateRequestDto: SampleCreate;
  CreateResponseDto: SampleResponse;
  FindByIdResponseDto: SampleResponse;
  FindOneResponseDto: SampleResponse;
  FindAllResponseDto: SampleResponse[];
  UpdateRequestDto: SampleUpdate;
  UpdateResponseDto: SampleResponse;
  DeleteResponseDto: SampleResponse;
  PaginatedResponseDto: SampleResponse;
}
```

## 3. Repository (sample.repository.ts)

Extend AbstractCrudMongoRepository:

### Multi-Tenant Repository

```typescript
import { AbstractCrudMongoRepository } from 'koa-inversify-framework/abstract';
import { Repository } from 'koa-inversify-framework/stereotype';
import { SampleSchema, sampleSchema, SampleEntity } from './sample.entity';

export const SampleRepositorySymbol = Symbol.for('SampleRepository');

@Repository(SampleRepositorySymbol, { multiTenant: true })
export class SampleRepository extends AbstractCrudMongoRepository<SampleSchema> {
  constructor() {
    super(sampleSchema, 'samples');
  }

  async findByEmail(email: string): Promise<SampleEntity | null> {
    return this.findOne({ email });
  }
}
```

### Single-Tenant Repository

```typescript
import { AbstractCrudMongoRepository } from 'koa-inversify-framework/abstract';
import { Repository } from 'koa-inversify-framework/stereotype';
import { SampleSchema, sampleSchema, SampleEntity } from './sample.entity';

export const SampleRepositorySymbol = Symbol.for('SampleRepository');

@Repository(SampleRepositorySymbol)
export class SampleRepository extends AbstractCrudMongoRepository<SampleSchema> {
  constructor() {
    super(sampleSchema, 'samples');
  }

  async findByEmail(email: string): Promise<SampleEntity | null> {
    return this.findOne({ email });
  }
}
```

## 4. Mapper (sample.mapper.ts)

Extend AbstractCrudMapper:

```typescript
import {
  AbstractCrudMapper,
  MapperSchemas,
} from 'koa-inversify-framework/abstract';
import { Mapper } from 'koa-inversify-framework/stereotype';
import { SampleDtoTypes, sampleResponseSchema } from './sample.dto';
import { SampleSchema } from './sample.entity';

export const SampleMapperSymbol = Symbol.for('SampleMapper');

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

## 5. Service (sample.service.ts)

Extend AbstractCrudService:

### Multi-Tenant Service

```typescript
import {
  AbstractCrudService,
  CreateInput,
} from 'koa-inversify-framework/abstract';
import { Service } from 'koa-inversify-framework/stereotype';
import { inject } from 'inversify';
import { SampleDtoTypes } from './sample.dto';
import { SampleEntity, SampleSchema } from './sample.entity';
import { SampleRepository, SampleRepositorySymbol } from './sample.repository';

export const SampleServiceSymbol = Symbol.for('SampleService');

@Service(SampleServiceSymbol, { multiTenant: true })
export class SampleService extends AbstractCrudService<
  SampleSchema,
  SampleDtoTypes
> {
  @inject(SampleRepositorySymbol) protected repository!: SampleRepository;

  protected buildCreateData(
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

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }
}
```

### Single-Tenant Service

```typescript
@Service(SampleServiceSymbol)
export class SampleService extends AbstractCrudService<
  SampleSchema,
  SampleDtoTypes
> {
  // Same implementation, but without multiTenant: true
}
```

## 6. Controller (sample.controller.ts)

Extend AbstractCrudController:

### Multi-Tenant Controller

```typescript
import { AbstractCrudController } from 'koa-inversify-framework/abstract';
import { Controller } from 'koa-inversify-framework/stereotype';
import {
  Get,
  Post,
  Put,
  Delete,
  SwaggerDoc,
  SwaggerDocController,
  ZodValidateRequest,
} from 'koa-inversify-framework/decorator';
import {
  commonErrorResponses,
  RequestParamsIdAndTenantIdSchema,
  RequestParamsTenantIdSchema,
} from 'koa-inversify-framework/common';
import { inject } from 'inversify';
import { Context } from 'koa';
import { SampleService, SampleServiceSymbol } from './sample.service';
import { SampleMapper, SampleMapperSymbol } from './sample.mapper';
import {
  SampleDtoTypes,
  sampleCreateSchema,
  sampleUpdateSchema,
  sampleResponseSchema,
} from './sample.dto';
import { SampleSchema } from './sample.entity';

export const SampleControllerSymbol = Symbol.for('SampleController');

@SwaggerDocController({
  name: 'Samples',
  description: 'Sample management',
  tags: ['Samples'],
})
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

  @SwaggerDoc({
    summary: 'Create sample',
    tags: ['Samples'],
    request: {
      params: RequestParamsTenantIdSchema,
      body: {
        content: {
          'application/json': {
            schema: sampleCreateSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Sample created',
        content: {
          'application/json': {
            schema: sampleResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({
    params: RequestParamsTenantIdSchema,
    body: sampleCreateSchema,
  })
  @Post('/')
  async create(ctx: Context): Promise<void> {
    return super.create(ctx);
  }

  @SwaggerDoc({
    summary: 'List samples',
    tags: ['Samples'],
    request: {
      params: RequestParamsTenantIdSchema,
    },
    responses: {
      200: {
        description: 'Paginated list of samples',
      },
      400: commonErrorResponses[400],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({ params: RequestParamsTenantIdSchema })
  @Get('/')
  async findAllPaginated(ctx: Context): Promise<void> {
    return super.findAllPaginated(ctx);
  }

  @SwaggerDoc({
    summary: 'Get sample by ID',
    tags: ['Samples'],
    request: {
      params: RequestParamsIdAndTenantIdSchema,
    },
    responses: {
      200: {
        description: 'Sample found',
        content: {
          'application/json': {
            schema: sampleResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({ params: RequestParamsIdAndTenantIdSchema })
  @Get('/:id')
  async findById(ctx: Context): Promise<void> {
    return super.findById(ctx);
  }

  @SwaggerDoc({
    summary: 'Update sample',
    tags: ['Samples'],
    request: {
      params: RequestParamsIdAndTenantIdSchema,
      body: {
        content: {
          'application/json': {
            schema: sampleUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Sample updated',
        content: {
          'application/json': {
            schema: sampleResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({
    params: RequestParamsIdAndTenantIdSchema,
    body: sampleUpdateSchema,
  })
  @Put('/:id')
  async update(ctx: Context): Promise<void> {
    return super.update(ctx);
  }

  @SwaggerDoc({
    summary: 'Delete sample',
    tags: ['Samples'],
    request: {
      params: RequestParamsIdAndTenantIdSchema,
    },
    responses: {
      200: {
        description: 'Sample deleted',
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({ params: RequestParamsIdAndTenantIdSchema })
  @Delete('/:id')
  async delete(ctx: Context): Promise<void> {
    return super.delete(ctx);
  }
}
```

### Single-Tenant Controller

```typescript
@Controller(SampleControllerSymbol, { basePath: '/api/samples' })
export class SampleController extends AbstractCrudController<
  SampleSchema,
  SampleDtoTypes
> {
  // Same implementation without multiTenant: true
  // Routes don't include :tenantId parameter
}
```

## 7. Module (sample.module.ts)

Extend AbstractModule:

```typescript
import { AbstractModule } from '@/abstract';
import { SampleController, SampleControllerSymbol } from './sample.controller';
import { SampleService, SampleServiceSymbol } from './sample.service';
import { SampleRepository, SampleRepositorySymbol } from './sample.repository';
import { SampleMapper, SampleMapperSymbol } from './sample.mapper';

export class SampleModule extends AbstractModule {
  protected runBind(): void {
    this.container
      .bind(SampleRepositorySymbol)
      .to(SampleRepository)
      .inSingletonScope();
    this.container.bind(SampleMapperSymbol).to(SampleMapper).inSingletonScope();
    this.container
      .bind(SampleServiceSymbol)
      .to(SampleService)
      .inSingletonScope();
    this.container
      .bind(SampleControllerSymbol)
      .to(SampleController)
      .inSingletonScope();
  }

  getControllerSymbol(): symbol {
    return SampleControllerSymbol;
  }
}
```

## Key Patterns

### Symbol Naming

```typescript
// Define once and export
export const [Name]Symbol = Symbol.for('Name');

// ALWAYS import - NEVER recreate with Symbol.for('string')
import { KoaServerSymbol } from '@/infrastructure/koa/koaServer.provider';
```

### Decorator Usage

- `@Repository(symbol, options?)` - marks class as repository
  - First parameter: DI symbol
  - `{ multiTenant: true }` for multi-tenant repositories
- `@Mapper(symbol)` - marks class as mapper
  - First parameter: DI symbol
- `@Service(symbol, options?)` - marks class as service
  - First parameter: DI symbol
  - `{ multiTenant: true }` for multi-tenant services
- `@Controller(symbol, options)` - marks class as controller
  - First parameter: DI symbol
  - `{ basePath: string, multiTenant?: boolean }`
- `@Get/@Post/@Put/@Patch/@Delete(path)` - route decorators
- `@SwaggerDoc(options)` - Swagger documentation decorator
- `@SwaggerDocController(options)` - Swagger controller documentation decorator
- `@ZodValidateRequest(schemas)` - Request validation decorator
- Registration happens manually in Module's `runBind()` method

### Dependency Injection

```typescript
constructor(@inject(Symbol) dependency: Type) {}
```

### Abstract Methods to Implement

- **Service**: `buildCreateDataFromDto()`, `buildUpdate()`
- **Module**: `runBind()`, `getControllerSymbol()`

### Key Changes from Previous Version

- **New layered architecture**: AbstractBase → Abstract* → AbstractCrud*
- **Decorator changes**: Symbols as first parameter (e.g., `@Service(Symbol, options)`)
- **Service changes**: `buildUpdate()` instead of `buildUpdateQuery()`
- **Mapper changes**: `paginatedItemSchema` instead of `paginatedResponseSchema`
- **Repository changes**: Simplified constructor (schema, collectionName)
- **Import changes**: Use full package imports (e.g., `koa-inversify-framework/abstract`)
- **Multi-tenant**: Automatic database resolution via ExecutionContext
- **Swagger**: Built-in decorators for API documentation
- **Validation**: Built-in Zod validation decorators

## What Framework Provides

- CRUD operations (create, findById, findAll, update, delete)
- Pagination support
- Error handling
- Validation (via Zod schemas)
- Multi-tenancy (tenantId in routes)
- Telemetry (@TraceAsync)
- MongoDB connection management
- Logging
- Authentication & Authorization (via `.external/auth-client-js` integration)
  - Remote validation via IDM backend
  - Decorator-based API (@Authentication, @Authorize)
  - Framework-agnostic auth client library
