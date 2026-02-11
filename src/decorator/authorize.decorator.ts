import 'reflect-metadata';
import { Context } from 'koa';
import { collectMetadataFromPrototypeChain } from './metadata.util';
import type { IdmAuthGrn } from '@idm-auth/auth-client';

const AuthorizeMetadataKey = Symbol.for('authorize:metadata');

export type ResourceBuilder = (grn: IdmAuthGrn, ctx: Context) => IdmAuthGrn;

const defaultResourceBuilder: ResourceBuilder = (grn: IdmAuthGrn): IdmAuthGrn =>
  grn;

export interface AuthorizeOptions {
  operation: string;
  resource?: ResourceBuilder;
  partition?: string;
  region?: string;
}

export type AuthorizeMetadataMap = Record<string, AuthorizeOptions>;

export type AuthorizeOptionsWithResource = AuthorizeOptions & {
  resource: ResourceBuilder;
};

export function Authorize(options: AuthorizeOptions) {
  return function (target: object, propertyKey: string | symbol) {
    const authorizations: AuthorizeMetadataMap =
      (Reflect.getMetadata(AuthorizeMetadataKey, target) as
        | AuthorizeMetadataMap
        | undefined) || {};

    authorizations[propertyKey as string] = {
      ...options,
      resource: options.resource || defaultResourceBuilder,
    };

    Reflect.defineMetadata(AuthorizeMetadataKey, authorizations, target);
  };
}

export function getAuthorizeMetadata(
  targetClass: object
): AuthorizeMetadataMap {
  return collectMetadataFromPrototypeChain<AuthorizeMetadataMap>(
    (targetClass as { prototype: object }).prototype,
    AuthorizeMetadataKey
  );
}
