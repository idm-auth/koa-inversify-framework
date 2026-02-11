import { Context, Next } from 'koa';
import { Container } from 'inversify';

export type KoaMiddleware = (ctx: Context, next: Next) => Promise<void>;

export type MiddlewareBuilderFn = (
  controllerClass: new (...args: never[]) => object,
  methodName: string,
  container: Container
) => KoaMiddleware | null;
