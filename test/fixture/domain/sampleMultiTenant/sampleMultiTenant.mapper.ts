import { AbstractCrudMapper, MapperSchemas } from '@/abstract';
import { Mapper } from '@/stereotype';
import { SampleMultiTenantDtoTypes, sampleMultiTenantResponseSchema } from './sampleMultiTenant.dto';
import { SampleMultiTenantSchema } from './sampleMultiTenant.entity';

export const SampleMultiTenantMapperSymbol = Symbol.for('SampleMultiTenantMapper');

@Mapper(SampleMultiTenantMapperSymbol)
export class SampleMultiTenantMapper extends AbstractCrudMapper<SampleMultiTenantSchema, SampleMultiTenantDtoTypes> {
  constructor() {
    const schemas: MapperSchemas<SampleMultiTenantDtoTypes> = {
      createResponseSchema: sampleMultiTenantResponseSchema,
      findByIdResponseSchema: sampleMultiTenantResponseSchema,
      findOneResponseSchema: sampleMultiTenantResponseSchema,
      updateResponseSchema: sampleMultiTenantResponseSchema,
      deleteResponseSchema: sampleMultiTenantResponseSchema,
      paginatedItemSchema: sampleMultiTenantResponseSchema,
    };
    super(schemas);
  }
}
