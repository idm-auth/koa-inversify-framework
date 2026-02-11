import 'reflect-metadata';
import { collectMetadataFromPrototypeChain } from './metadata.util';

export const RealmTenantResolverSymbol = Symbol.for('RealmTenantResolver');

const InjectCoreTenantIdMetadataKey = Symbol.for('injectCoreTenantId:metadata');

export type InjectCoreTenantIdMetadataMap = Record<string, boolean>;

export function InjectCoreTenantId() {
  return function (target: object, propertyKey: string | symbol) {
    const metadata: InjectCoreTenantIdMetadataMap =
      (Reflect.getMetadata(InjectCoreTenantIdMetadataKey, target) as
        | InjectCoreTenantIdMetadataMap
        | undefined) || {};

    metadata[propertyKey as string] = true;

    Reflect.defineMetadata(InjectCoreTenantIdMetadataKey, metadata, target);
  };
}

export function getInjectCoreTenantIdMetadata(targetClass: object): InjectCoreTenantIdMetadataMap {
  return collectMetadataFromPrototypeChain<InjectCoreTenantIdMetadataMap>(
    (targetClass as { prototype: object }).prototype,
    InjectCoreTenantIdMetadataKey
  );
}
