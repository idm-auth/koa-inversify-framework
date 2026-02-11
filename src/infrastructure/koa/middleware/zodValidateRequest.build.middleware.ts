import { Context, Next } from 'koa';
import { ValidationErrorResponse } from '@/error/validationError';
import {
  ZodValidateRequestOptions,
  getZodValidationMetadata,
} from '@/decorator/zodValidateRequest.decorator';
import { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';
import { LoggerProvider, LoggerSymbol } from '@/infrastructure/logger/logger.provider';
import { Container } from 'inversify';

function validateRequest(
  ctx: Context,
  schemas: ZodValidateRequestOptions,
  logger: ReturnType<LoggerProvider['getLogger']>
): ValidationErrorResponse | null {
  logger.debug({ schemas: Object.keys(schemas) }, 'Validating request');
  const errors: Array<{ path: string; message: string }> = [];

  if (schemas.params) {
    logger.debug({ params: ctx.params }, 'Validating params');
    const result = schemas.params.safeParse(ctx.params);
    if (!result.success) {
      logger.debug({ issues: result.error.issues }, 'Params validation failed');
      result.error.issues.forEach((err) => {
        errors.push({
          path: `params.${err.path.join('.')}`,
          message: err.message,
        });
      });
    }
  }

  if (schemas.body) {
    logger.debug({ body: ctx.request.body }, 'Validating body');
    const result = schemas.body.safeParse(ctx.request.body);
    if (!result.success) {
      logger.debug({ issues: result.error.issues }, 'Body validation failed');
      result.error.issues.forEach((err) => {
        errors.push({
          path: `body.${err.path.join('.')}`,
          message: err.message,
        });
      });
    }
  }

  if (schemas.query) {
    logger.debug({ query: ctx.query }, 'Validating query');
    const result = schemas.query.safeParse(ctx.query);
    if (!result.success) {
      logger.debug({ issues: result.error.issues }, 'Query validation failed');
      result.error.issues.forEach((err) => {
        errors.push({
          path: `query.${err.path.join('.')}`,
          message: err.message,
        });
      });
    }
  }

  if (errors.length > 0) {
    logger.debug({ errors }, 'Validation failed');
    return {
      error: 'Validation failed',
      message: 'Request validation failed',
      details: errors,
    };
  }

  logger.debug('Validation passed');
  return null;
}

function zodValidateRequestMiddleware(
  schemas: ZodValidateRequestOptions,
  container: Container
): KoaMiddleware {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  return async (ctx: Context, next: Next) => {
    const validationError = validateRequest(ctx, schemas, logger);
    if (validationError) {
      ctx.status = 400;
      ctx.body = validationError;
      return;
    }
    await next();
  };
}

export const buildZodValidateRequest: MiddlewareBuilderFn = (
  controllerClass,
  methodName,
  container
) => {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  const validations = getZodValidationMetadata(controllerClass);
  const validation = validations[methodName];

  if (!validation) {
    return null;
  }

  logger.debug({ controllerClass: controllerClass.name, methodName }, 'ZodValidateRequest middleware: Initialized');
  return zodValidateRequestMiddleware(validation, container);
};
