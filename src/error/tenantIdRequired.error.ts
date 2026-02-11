export class TenantIdRequiredError extends Error {
  constructor(source: string, name: string) {
    super(`Multi-tenant ${source} '${name}' requires tenantId in execution context.`);
    this.name = 'TenantIdRequiredError';
  }
}
