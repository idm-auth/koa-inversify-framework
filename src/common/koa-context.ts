import { Context } from 'koa';

export type ContextWithParams<P extends Record<string, string | undefined>> = Context & { params: P };

export type ContextWithBody<B> = Context & { request: { body: B } };

export type ContextWithParamsAndBody<
  P extends Record<string, string | undefined>,
  B
> = Context & { params: P; request: { body: B } };

export type IdParam = { id: string };
export type TenantIdParam = { tenantId?: string };
export type IdWithTenantParam = IdParam & TenantIdParam;
