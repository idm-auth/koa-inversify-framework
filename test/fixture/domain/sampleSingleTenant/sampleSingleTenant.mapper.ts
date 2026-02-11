import { AbstractCrudMapper, MapperSchemas } from '@/abstract';
import { Mapper } from '@/stereotype';
import { SampleSingleTenantDtoTypes, sampleSingleTenantResponseSchema } from './sampleSingleTenant.dto';
import { SampleSingleTenantSchema } from './sampleSingleTenant.entity';

export const SampleSingleTenantMapperSymbol = Symbol.for('SampleSingleTenantMapper');

@Mapper(SampleSingleTenantMapperSymbol)
export class SampleSingleTenantMapper extends AbstractCrudMapper<SampleSingleTenantSchema, SampleSingleTenantDtoTypes> {
  constructor() {
    const schemas: MapperSchemas<SampleSingleTenantDtoTypes> = {
      createResponseSchema: sampleSingleTenantResponseSchema,
      findByIdResponseSchema: sampleSingleTenantResponseSchema,
      findOneResponseSchema: sampleSingleTenantResponseSchema,
      updateResponseSchema: sampleSingleTenantResponseSchema,
      deleteResponseSchema: sampleSingleTenantResponseSchema,
      paginatedItemSchema: sampleSingleTenantResponseSchema,
    };
    super(schemas);
  }
}
