import { Configuration } from '@/stereotype/configuration.stereotype';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const OpenApiRegistrySymbol = Symbol.for('OpenApiRegistry');

@Configuration(OpenApiRegistrySymbol)
export class OpenApiRegistryProvider {
  constructor(private registry: OpenAPIRegistry) {}

  getRegistry(): OpenAPIRegistry {
    return this.registry;
  }
}