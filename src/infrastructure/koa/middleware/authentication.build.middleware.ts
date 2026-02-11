import { Context, Next } from 'koa';
import { trace, context as otelContext } from '@opentelemetry/api';
import {
  getAuthenticationMetadata,
  AuthenticationOptions,
} from '@/decorator/authentication.decorator';
import { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { IdmClient, IdmClientSymbol } from '@/infrastructure/idm-client';
import { UnauthorizedError } from '@/error';

function validateAuthenticationMiddleware(
  _options: AuthenticationOptions,
  idmClient: IdmClient,
  logger: ReturnType<LoggerProvider['getLogger']>
): KoaMiddleware {
  return async (
    ctx: Context & {
      params?: { tenantId?: string };
      state?: { authenticated?: boolean; accountId?: string };
    },
    next: Next
  ) => {
    const tracer = trace.getTracer('koa-inversify-framework');
    const span = tracer.startSpan('middleware.authentication');

    return otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
      try {
        logger.debug({ path: ctx.path, method: ctx.method }, 'Authentication middleware: Start');

    const authHeader = ctx.headers.authorization;

    if (!authHeader) {
      logger.warn('Authentication middleware: Missing Authorization header');
      throw new UnauthorizedError('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn({ authHeader: authHeader.substring(0, 20) }, 'Authentication middleware: Invalid header format');
      throw new UnauthorizedError('Invalid Authorization header format');
    }

    const token = authHeader.substring(7);
    const tenantId = ctx.params?.tenantId;

    logger.debug({ tenantId, tokenLength: token.length }, 'Authentication middleware: Extracted token and tenantId');

    if (!tenantId) {
      logger.error('Authentication middleware: Missing tenantId in params');
      ctx.throw(400, 'Missing tenantId');
    }

    logger.debug({ tenantId }, 'Authentication middleware: Calling idmClient.validateAuthentication()');
    const result = await idmClient.validateAuthentication(token, tenantId);
    logger.debug({ valid: result.valid, accountId: result.accountId }, 'Authentication middleware: Validation result');

    if (!result.valid) {
      logger.warn({ error: result.error }, 'Authentication middleware: Token validation failed');
      throw new UnauthorizedError(result.error || 'Invalid token');
    }

    if (!result.accountId) {
      logger.error('Authentication middleware: Missing accountId in validation response');
      throw new UnauthorizedError('Invalid token payload');
    }

    ctx.state.authenticated = true;
    ctx.state.accountId = result.accountId;
    ctx.state.idmAuthUserToken = token;
    span.setAttributes({ 'auth.accountId': result.accountId, 'auth.tenantId': tenantId });
    logger.debug({ accountId: result.accountId }, 'Authentication middleware: User authenticated, accountId set in ctx.state');
    
    await next();
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  };
}

export const buildAuthenticationMiddleware: MiddlewareBuilderFn = (
  controllerClass,
  methodName,
  container
) => {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();
  const idmClient = container.get<IdmClient>(IdmClientSymbol);

  const metadata = getAuthenticationMetadata(controllerClass, methodName);

  if (!metadata) {
    return null;
  }

  logger.debug(
    { controllerClass: controllerClass.name, methodName },
    'ValidateAuthentication middleware: Initialized'
  );
  return validateAuthenticationMiddleware(metadata, idmClient, logger);
};
