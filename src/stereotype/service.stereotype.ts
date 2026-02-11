import { createStereotype } from '@/stereotype/stereotype.utils';
import { setStereotypeIdentity, StereotypeType } from '@/stereotype/stereotype.metadata';
import { injectFromHierarchy } from 'inversify';

const ServiceOptionsKey = Symbol.for('service:options');

export interface ServiceOptions {
  multiTenant: boolean;
}

export function Service(symbol: symbol, options?: ServiceOptions) {
  const baseDecorator = createStereotype();
  const injectFromHierarchyDecorator = injectFromHierarchy({
    extendProperties: true,
  });

  return function <T extends new (...args: never[]) => object>(target: T): T {
    setStereotypeIdentity(target, symbol, StereotypeType.Service);
    
    const serviceOptions: ServiceOptions = {
      multiTenant: options?.multiTenant ?? false,
    };
    Reflect.defineMetadata(ServiceOptionsKey, serviceOptions, target);

    const decoratedTarget = baseDecorator(target);
    const final = injectFromHierarchyDecorator(decoratedTarget);
    
    return final ?? decoratedTarget;
  };
}

export function getServiceOptions(
  target: object
): ServiceOptions | undefined {
  const metadata: unknown = Reflect.getMetadata(ServiceOptionsKey, target);
  if (!metadata) return undefined;
  return metadata as ServiceOptions;
}
