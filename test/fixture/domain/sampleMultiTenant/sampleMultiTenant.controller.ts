import { AbstractCrudController } from '@/abstract';
import {
  RequestParamsIdAndTenantIdSchema,
  RequestParamsTenantIdSchema,
} from '@/common/request';
import { commonErrorResponses } from '@/common/swaggerResponse';
import {
  SwaggerDoc,
  SwaggerDocController,
  ZodValidateRequest,
} from '@/decorator';
import { Delete, Get, Post, Put } from '@/decorator/route.decorator';
import { Controller } from '@/stereotype';
import { inject } from 'inversify';
import { Context } from 'koa';
import {
  SampleMultiTenantDtoTypes,
  sampleMultiTenantCreateSchema,
  sampleMultiTenantResponseSchema,
  sampleMultiTenantUpdateSchema,
} from './sampleMultiTenant.dto';
import {
  SampleMultiTenantCreate,
  SampleMultiTenantSchema,
} from './sampleMultiTenant.entity';
import {
  SampleMultiTenantMapper,
  SampleMultiTenantMapperSymbol,
} from './sampleMultiTenant.mapper';
import {
  SampleMultiTenantService,
  SampleMultiTenantServiceSymbol,
} from './sampleMultiTenant.service';

export const SampleMultiTenantControllerSymbol = Symbol.for(
  'SampleMultiTenantController'
);

@SwaggerDocController({
  name: 'Sample Multi-Tenant',
  description: 'Multi-tenant sample resource management',
  tags: ['SampleMultiTenant'],
})
@Controller(SampleMultiTenantControllerSymbol, {
  basePath: '/api/realm/:tenantId/sample-multi-tenant',
  multiTenant: true,
})
export class SampleMultiTenantController extends AbstractCrudController<
  SampleMultiTenantSchema,
  SampleMultiTenantDtoTypes,
  SampleMultiTenantCreate
> {
  constructor(
    @inject(SampleMultiTenantServiceSymbol)
    protected service: SampleMultiTenantService,
    @inject(SampleMultiTenantMapperSymbol)
    protected mapper: SampleMultiTenantMapper
  ) {
    super();
  }

  @SwaggerDoc({
    summary: 'Create sample multi-tenant',
    description: 'Creates a new sample multi-tenant record',
    tags: ['SampleMultiTenant'],
    request: {
      params: RequestParamsTenantIdSchema,
      body: {
        content: {
          'application/json': {
            schema: sampleMultiTenantCreateSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Sample multi-tenant created successfully',
        content: {
          'application/json': {
            schema: sampleMultiTenantResponseSchema,
          },
        },
      },
      400: commonErrorResponses[400],
      409: commonErrorResponses[409],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({
    params: RequestParamsTenantIdSchema,
    body: sampleMultiTenantCreateSchema,
  })
  @Post('/')
  async create(
    ctx: Context & { request: { body: { name: string; email: string } } }
  ): Promise<void> {
    return super.create(ctx);
  }

  @SwaggerDoc({
    summary: 'List sample multi-tenant records',
    description: 'Returns paginated list of sample multi-tenant records',
    tags: ['SampleMultiTenant'],
    request: {
      params: RequestParamsTenantIdSchema,
    },
    responses: {
      200: {
        description: 'Paginated list of sample multi-tenant records',
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
    summary: 'Get sample multi-tenant by ID',
    description: 'Returns a single sample multi-tenant record',
    tags: ['SampleMultiTenant'],
    request: {
      params: RequestParamsIdAndTenantIdSchema,
    },
    responses: {
      200: {
        description: 'Sample multi-tenant found',
        content: {
          'application/json': {
            schema: sampleMultiTenantResponseSchema,
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
  async findById(
    ctx: Context & { params: { id: string; tenantId?: string } }
  ): Promise<void> {
    return super.findById(ctx);
  }

  @SwaggerDoc({
    summary: 'Update sample multi-tenant',
    description: 'Updates an existing sample multi-tenant record',
    tags: ['SampleMultiTenant'],
    request: {
      params: RequestParamsIdAndTenantIdSchema,
      body: {
        content: {
          'application/json': {
            schema: sampleMultiTenantUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Sample multi-tenant updated successfully',
        content: {
          'application/json': {
            schema: sampleMultiTenantResponseSchema,
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
    params: RequestParamsIdAndTenantIdSchema,
    body: sampleMultiTenantUpdateSchema,
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
    summary: 'Delete sample multi-tenant',
    description: 'Deletes a sample multi-tenant record',
    tags: ['SampleMultiTenant'],
    request: {
      params: RequestParamsIdAndTenantIdSchema,
    },
    responses: {
      200: {
        description: 'Sample multi-tenant deleted successfully',
      },
      400: commonErrorResponses[400],
      404: commonErrorResponses[404],
      500: commonErrorResponses[500],
    },
  })
  @ZodValidateRequest({ params: RequestParamsIdAndTenantIdSchema })
  @Delete('/:id')
  async delete(
    ctx: Context & { params: { id: string; tenantId?: string } }
  ): Promise<void> {
    return super.delete(ctx);
  }
}
