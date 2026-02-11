import type { Context, Next } from 'koa';
import { trace, context as otelContext } from '@opentelemetry/api';
import { Container } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import type { ExecutionContextProvider } from '@/infrastructure/context/executionContext.provider';
import { ExecutionContextSymbol } from '@/infrastructure/context/executionContext.provider';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import type { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';

function executionContextMiddleware(container: Container): KoaMiddleware {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  return async (
    ctx: Context & { params?: { tenantId?: string }; state?: { tenantId?: string } },
    next: Next
  ) => {
    const tracer = trace.getTracer('koa-inversify-framework');
    const span = tracer.startSpan('middleware.executionContext');

    return otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
      try {
        logger.debug(
          { ctx_path: ctx.path },
          'ExecutionContext middleware: Starting'
        );

    const executionContext = container.get<ExecutionContextProvider>(
      ExecutionContextSymbol
    );

    const tenantId: string | null = ctx.params?.tenantId ?? ctx.state?.tenantId ?? null;

    logger.debug(
      { tenantId },
      'ExecutionContext middleware: Extracted tenantId'
    );

    const context = {
      globalTransactionId: uuidv4(),
      tenantId,
    };

    await executionContext.init(context, async () => {
      logger.debug(
        { tenantId },
        'ExecutionContext middleware: Context initialized'
      );
      span.setAttributes({ 'context.tenantId': tenantId || 'null', 'context.globalTransactionId': context.globalTransactionId });
      await next();
    });

    logger.debug(
      { tenantId },
      'ExecutionContext middleware: Request completed'
    );
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  };
}

export const buildExecutionContext: MiddlewareBuilderFn = (
  _controllerClass,
  _methodName,
  container
) => {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  logger.debug('ExecutionContext middleware: Initialized');
  return executionContextMiddleware(container);
};
