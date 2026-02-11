import { Context, Next } from 'koa';
import {
  getZodValidateResponseMetadata,
  ZodValidateResponseOptions,
} from '@/decorator/zodValidateResponse.decorator';
import { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';
import { LoggerProvider, LoggerSymbol } from '@/infrastructure/logger/logger.provider';

function zodValidateResponseMiddleware(
  _options: ZodValidateResponseOptions
): KoaMiddleware {
  return async (ctx: Context, next: Next) => {
    await next();
    // TODO: Implement response validation logic with options
  };
}

export const buildZodValidateResponse: MiddlewareBuilderFn = (
  controllerClass,
  methodName,
  container
) => {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();

  const metadata = getZodValidateResponseMetadata(controllerClass);
  const options = metadata[methodName];

  if (!options) {
    return null;
  }

  logger.debug({ controllerClass: controllerClass.name, methodName }, 'ZodValidateResponse middleware: Initialized');
  return zodValidateResponseMiddleware(options);
};
