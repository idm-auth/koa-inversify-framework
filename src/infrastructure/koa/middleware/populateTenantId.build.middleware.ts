import type { Context, Next } from 'koa';
import { Container } from 'inversify';
import { LoggerProvider, LoggerSymbol } from '@/infrastructure/logger/logger.provider';
import type { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';

function populateTenantIdMiddleware(container: Container): KoaMiddleware {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  return async (
    ctx: Context & { params?: { tenantId?: string }; state?: { tenantId?: string } },
    next: Next
  ) => {
    const tenantId = ctx.params?.tenantId;

    if (tenantId) {
      ctx.state = ctx.state || {};
      ctx.state.tenantId = tenantId;
      logger.debug({ tenantId }, 'PopulateTenantId middleware: Set tenantId in ctx.state');
    }

    await next();
  };
}

export const buildPopulateTenantId: MiddlewareBuilderFn = (
  _controllerClass,
  _methodName,
  container
) => {
  return populateTenantIdMiddleware(container);
};
