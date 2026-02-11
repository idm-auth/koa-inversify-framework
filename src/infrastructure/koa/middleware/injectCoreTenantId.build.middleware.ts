import type { Context, Next } from 'koa';
import { Container } from 'inversify';
import { AbstractTenantResolver, TenantResolverSymbol } from '@/index';
import {
  ExecutionContextProvider,
  ExecutionContextSymbol,
} from '@/infrastructure/context/executionContext.provider';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { getInjectCoreTenantIdMetadata } from '@/decorator/injectCoreTenantId.decorator';
import type { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';

function injectCoreTenantIdMiddleware(container: Container): KoaMiddleware {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  return async (ctx: Context, next: Next) => {
    logger.debug('InjectCoreTenantId middleware: Starting');

    const tenantResolver = container.get<AbstractTenantResolver>(TenantResolverSymbol);
    const executionContext = container.get<ExecutionContextProvider>(ExecutionContextSymbol);

    const tenantId = await tenantResolver.getTenantCorePublicUUID();
    
    ctx.state.tenantId = tenantId;
    executionContext.setTenantId(tenantId);

    logger.debug({ tenantId }, 'InjectCoreTenantId middleware: Injected core tenantId into ctx.state and ExecutionContext');

    await next();
  };
}

export const buildInjectCoreTenantId: MiddlewareBuilderFn = (
  controllerClass,
  methodName,
  container
) => {
  const metadata = getInjectCoreTenantIdMetadata(controllerClass);
  
  if (!metadata || !metadata[methodName]) {
    return null;
  }

  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  logger.debug({ controllerClass: controllerClass.name, methodName }, 'InjectCoreTenantId middleware: Initialized');
  return injectCoreTenantIdMiddleware(container);
};
