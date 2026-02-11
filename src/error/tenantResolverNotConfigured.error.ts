export class TenantResolverNotConfiguredError extends Error {
  public readonly statusCode = 500;
  public readonly isOperational = false;

  constructor(public readonly tenantId: string) {
    super(
      `TenantResolver not configured. Multi-tenant repository tried to resolve tenantId '${tenantId}'. ` +
      'Call framework.setTenantResolver() before init() to configure tenant resolution.'
    );
    this.name = 'TenantResolverNotConfiguredError';
    Error.captureStackTrace(this, this.constructor);
  }
}
