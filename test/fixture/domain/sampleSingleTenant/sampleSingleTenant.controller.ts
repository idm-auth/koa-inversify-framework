import { AbstractCrudController } from '@/abstract';
import { Controller } from '@/stereotype';
import { Get, Post, Put, Delete } from '@/decorator/route.decorator';
import {
  SwaggerDoc,
  SwaggerDocController,
  ZodValidateRequest,
  Authenticated,
} from '@/decorator';
import { commonErrorResponses } from '@/common/swaggerResponse';
import { inject } from 'inversify';
import { Context } from 'koa';
import {
  SampleSingleTenantService,
  SampleSingleTenantServiceSymbol,
} from './sampleSingleTenant.service';
import {
  SampleSingleTenantDtoTypes,
  sampleSingleTenantCreateSchema,
  sampleSingleTenantResponseSchema,
  sampleSingleTenantUpdateSchema,
} from './sampleSingleTenant.dto';
import { RequestParamsIdSchema } from '@/common/request';
import {
  SampleSingleTenantCreate,
  SampleSingleTenantSchema,
} from './sampleSingleTenant.entity';
import {
  SampleSingleTenantMapper,
  SampleSingleTenantMapperSymbol,
} from './sampleSingleTenant.mapper';

export const SampleSingleTenantControllerSymbol = Symbol.for(
  'SampleSingleTenantController'
);

@SwaggerDocController({
  name: 'Sample Single-Tenant',
  description: 'Single-tenant sample resource management',
  tags: ['SampleSingleTenant'],
})
@Controller(SampleSingleTenantControllerSymbol, {
  basePath: '/api/sample-single-tenant',
})
export class SampleSingleTenantController extends AbstractCrudController<
  SampleSingleTenantSchema,
  SampleSingleTenantDtoTypes,
  SampleSingleTenantCreate
> {
  constructor(
    @inject(SampleSingleTenantServiceSymbol)
    protected service: SampleSingleTenantService,
    @inject(SampleSingleTenantMapperSymbol)
    protected mapper: SampleSingleTenantMapper
  ) {
    super();
  }

  @SwaggerDoc({
    summary: 'Create sample single-tenant',
    description: 'Creates a new sample single-tenant record',
    tags: ['SampleSingleTenant'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: sampleSingleTenantCreateSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Sample single-tenant created successfully',
        content: {
          'application/json': {
            schema: sampleSingleTenantResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      401: commonErrorResponses[401],
      409: commonErrorResponses[409],
      500: commonErrorResponses[500],
    },
  })
  @Authenticated()
  @ZodValidateRequest({ body: sampleSingleTenantCreateSchema })
  @Post('/')
  async create(
    ctx: Context & { request: { body: { name: string; email: string } } }
  ): Promise<void> {
    return super.create(ctx);
  }

  @SwaggerDoc({
    summary: 'List sample single-tenant records',
    description: 'Returns paginated list of sample single-tenant records',
    tags: ['SampleSingleTenant'],
    responses: {
      200: {
        description: 'Paginated list of sample single-tenant records',
      },
      400: commonErrorResponses[400],
      500: commonErrorResponses[500],
    },
  })
  @Get('/')
  async findAllPaginated(ctx: Context): Promise<void> {
    return super.findAllPaginated(ctx);
  }

  @SwaggerDoc({
    summary: 'Get sample single-tenant by ID',
    description: 'Returns a single sample single-tenant record',
    tags: ['SampleSingleTenant'],
    request: {
      params: RequestParamsIdSchema,
    },
    responses: {
      200: {
        description: 'Sample single-tenant found',
        content: {
          'application/json': {
            schema: sampleSingleTenantResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({ params: RequestParamsIdSchema })
  @Get('/:id')
  async findById(
    ctx: Context & { params: { id: string; tenantId?: string } }
  ): Promise<void> {
    return super.findById(ctx);
  }

  @SwaggerDoc({
    summary: 'Update sample single-tenant',
    description: 'Updates an existing sample single-tenant record',
    tags: ['SampleSingleTenant'],
    request: {
      params: RequestParamsIdSchema,
      body: {
        content: {
          'application/json': {
            schema: sampleSingleTenantUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Sample single-tenant updated successfully',
        content: {
          'application/json': {
            schema: sampleSingleTenantResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      409: commonErrorResponses[409],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({
    params: RequestParamsIdSchema,
    body: sampleSingleTenantUpdateSchema,
  })
  @Put('/:id')
  async update(
    ctx: Context & {
      params: { id: string; tenantId?: string };
      request: { body: { name?: string; isActive?: boolean } };
    }
  ): Promise<void> {
    return super.update(ctx);
  }

  @SwaggerDoc({
    summary: 'Delete sample single-tenant',
    description: 'Deletes a sample single-tenant record',
    tags: ['SampleSingleTenant'],
    request: {
      params: RequestParamsIdSchema,
    },
    responses: {
      200: {
        description: 'Sample single-tenant deleted successfully',
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({ params: RequestParamsIdSchema })
  @Delete('/:id')
  async delete(
    ctx: Context & { params: { id: string; tenantId?: string } }
  ): Promise<void> {
    return super.delete(ctx);
  }
}
