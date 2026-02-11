import { EnvKey } from '@/common/env.types';
import {
  getAuthorizeMetadata,
  type AuthorizeOptionsWithResource,
} from '@/decorator/authorize.decorator';
import { ForbiddenError } from '@/error';
import {
  AbstractEnv,
  AbstractTenantResolver,
  EnvSymbol,
  TenantResolverSymbol,
} from '@/index';
import { IdmClient, IdmClientSymbol } from '@/infrastructure/idm-client';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { getControllerOptions } from '@/stereotype/controller.stereotype';
import type { IdmAuthGrn } from '@idm-auth/auth-client';
import {
  isValidGrn,
  stringifyGrn,
  stringifyAction,
} from '@idm-auth/auth-client';
import { context as otelContext, trace } from '@opentelemetry/api';
import { Context, Next } from 'koa';
import { KoaMiddleware, MiddlewareBuilderFn } from './middleware.types';

interface BuildGrnParams {
  options: AuthorizeOptionsWithResource;
  system: string;
  resourceName: string;
  basePath: string;
  tenantId: string;
  ctx: Context & { params?: Record<string, string | undefined> };
}

function buildGrn(
  params: BuildGrnParams,
  logger: ReturnType<LoggerProvider['getLogger']>
): string {
  const { options, system, resourceName, basePath, tenantId, ctx } = params;
  const resolvedBasePath = basePath.replace(
    /:(\w+)/g,
    (_, key: string) => ctx.params?.[key] || ''
  );
  const pathSuffix = ctx.path.startsWith(resolvedBasePath)
    ? ctx.path.slice(resolvedBasePath.length)
    : '';
  const resource =
    pathSuffix && pathSuffix !== '/'
      ? `${resourceName}${pathSuffix}`
      : `${resourceName}/*`;

  const grn: IdmAuthGrn = {
    partition: options.partition || 'global',
    system,
    region: options.region || '',
    tenantId,
    resource,
  };

  const finalGrn = options.resource(grn, ctx);
  const result = stringifyGrn(finalGrn);
  logger.debug({ resource: finalGrn.resource, result }, '[buildGrn] GRN built');
  return result;
}

function authorizeMiddleware(
  options: AuthorizeOptionsWithResource,
  system: string,
  resourceName: string,
  basePath: string,
  idmClient: IdmClient,
  tenantResolver: AbstractTenantResolver,
  env: AbstractEnv,
  logger: ReturnType<LoggerProvider['getLogger']>
): KoaMiddleware {
  return async (
    ctx: Context & {
      params?: { tenantId?: string; [key: string]: string | undefined };
      state?: {
        accountId?: string;
        idmAuthUserToken?: string;
        [key: string]: unknown;
      };
    },
    next: Next
  ) => {
    const tracer = trace.getTracer('koa-inversify-framework');
    const span = tracer.startSpan('middleware.authorize');

    return otelContext.with(
      trace.setSpan(otelContext.active(), span),
      async () => {
        try {
          logger.debug(
            { path: ctx.path, method: ctx.method },
            'Authorize middleware: Start'
          );

          const idmAuthUserToken = ctx.state?.idmAuthUserToken;
          const tenantId = ctx.params?.tenantId;

          if (!idmAuthUserToken || !tenantId) {
            logger.warn(
              { idmAuthUserToken: !!idmAuthUserToken, tenantId },
              'Authorize middleware: Missing token or tenantId'
            );
            throw new ForbiddenError('User not authenticated');
          }

          const action = stringifyAction({
            system,
            resource: resourceName,
            operation: options.operation,
          });
          const resource = buildGrn(
            {
              options,
              system,
              resourceName,
              basePath,
              tenantId,
              ctx,
            },
            logger
          );

          if (!isValidGrn(resource)) {
            logger.error(
              { resource },
              'Authorize middleware: Invalid GRN format'
            );
            throw new ForbiddenError('Invalid resource format');
          }

          const applicationRealmPublicUUID =
            env.get(EnvKey.IDM_AUTH_APPLICATION_REALM_PUBLIC_UUID) !==
            'UNDEFINED'
              ? env.get(EnvKey.IDM_AUTH_APPLICATION_REALM_PUBLIC_UUID)
              : await tenantResolver.getTenantCorePublicUUID();
          const result = await idmClient.authorize({
            applicationRealmPublicUUID,
            idmAuthUserToken,
            grn: resource,
            action,
          });

          if (!result.allowed) {
            logger.warn(
              { action, resource, error: result.error },
              'Authorize middleware: Access denied'
            );
            span.setAttributes({
              'authz.allowed': false,
              'authz.action': action,
              'authz.resource': resource,
            });
            throw new ForbiddenError(result.error || 'Access denied');
          }

          span.setAttributes({
            'authz.allowed': true,
            'authz.action': action,
            'authz.resource': resource,
          });
          logger.debug(
            { action, resource },
            'Authorize middleware: Access granted'
          );

          await next();
        } catch (error) {
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
  };
}

export const buildAuthorize: MiddlewareBuilderFn = (
  controllerClass,
  methodName,
  container
) => {
  const loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
  const logger = loggerProvider.getLogger();
  const idmClient = container.get<IdmClient>(IdmClientSymbol);
  const tenantResolver =
    container.get<AbstractTenantResolver>(TenantResolverSymbol);
  const env = container.get<AbstractEnv>(EnvSymbol);

  const metadata = getAuthorizeMetadata(controllerClass);
  const options = metadata[methodName];

  if (!options) {
    return null;
  }

  const controllerOptions = getControllerOptions(controllerClass);
  if (!controllerOptions?.system || !controllerOptions?.resource) {
    logger.error(
      { controllerClass: controllerClass.name, methodName },
      'Authorize middleware: Controller missing system or resource in @Controller options'
    );
    throw new Error(
      `Controller ${controllerClass.name} must define 'system' and 'resource' in @Controller options when using @Authorize`
    );
  }

  logger.debug(
    {
      controllerClass: controllerClass.name,
      methodName,
      system: controllerOptions.system,
      resource: controllerOptions.resource,
      operation: options.operation,
      action: `${controllerOptions.system}:${controllerOptions.resource}:${options.operation}`,
    },
    'Authorize middleware: Initialized'
  );

  return authorizeMiddleware(
    options as AuthorizeOptionsWithResource,
    controllerOptions.system,
    controllerOptions.resource,
    controllerOptions.basePath,
    idmClient,
    tenantResolver,
    env,
    logger
  );
};
