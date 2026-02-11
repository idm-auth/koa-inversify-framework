export class MultiTenantConfigurationError extends Error {
  public readonly statusCode = 500;
  public readonly isOperational = false;

  constructor(
    public readonly controllerName: string,
    message?: string
  ) {
    super(
      message ||
        `Controller ${controllerName} is configured as multiTenant=true but tenantId is missing from route params. ` +
        `Ensure route has ':tenantId' parameter and it's being validated.`
    );
    this.name = 'MultiTenantConfigurationError';
    Error.captureStackTrace(this, this.constructor);
  }
}
