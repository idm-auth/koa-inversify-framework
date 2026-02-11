import 'reflect-metadata';
import { collectMetadataFromPrototypeChain } from './metadata.util';

const AuthenticationMetadataKey = Symbol.for('authentication:metadata');

export interface AuthenticationOptions {
  required?: boolean;
  schemes?: string[];
}

export type AuthenticationMetadataMap = Record<string, AuthenticationOptions>;

export function Authenticated(options: AuthenticationOptions = {}) {
  return function (target: object, propertyKey: string | symbol) {
    const metadata: AuthenticationMetadataMap =
      (Reflect.getMetadata(AuthenticationMetadataKey, target) as
        | AuthenticationMetadataMap
        | undefined) || {};

    metadata[propertyKey as string] = options;

    Reflect.defineMetadata(AuthenticationMetadataKey, metadata, target);
  };
}

export function getAuthenticationMetadata(targetClass: object, methodName?: string): AuthenticationMetadataMap | AuthenticationOptions | undefined {
  const allMetadata = collectMetadataFromPrototypeChain<AuthenticationMetadataMap>(
    (targetClass as { prototype: object }).prototype,
    AuthenticationMetadataKey
  );
  return methodName ? allMetadata[methodName] : allMetadata;
}
