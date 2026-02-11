import { createStereotype } from '@/stereotype/stereotype.utils';
import { setStereotypeIdentity, StereotypeType } from '@/stereotype/stereotype.metadata';
import { injectFromHierarchy } from 'inversify';

const RepositoryOptionsKey = Symbol.for('repository:options');

export interface RepositoryOptions {
  multiTenant: boolean;
}

export function Repository(symbol: symbol, options?: RepositoryOptions) {
  const baseDecorator = createStereotype();
  const injectFromHierarchyDecorator = injectFromHierarchy({ extendProperties: true });

  return function <T extends new (...args: never[]) => object>(target: T): T {
    setStereotypeIdentity(target, symbol, StereotypeType.Repository);
    
    const repositoryOptions: RepositoryOptions = {
      multiTenant: options?.multiTenant ?? false,
    };
    Reflect.defineMetadata(RepositoryOptionsKey, repositoryOptions, target);
    
    const decoratedTarget = baseDecorator(target);
    const final = injectFromHierarchyDecorator(decoratedTarget);
    
    return final ?? decoratedTarget;
  };
}

export function getRepositoryOptions(
  target: object
): RepositoryOptions | undefined {
  const metadata: unknown = Reflect.getMetadata(
    RepositoryOptionsKey,
    target
  );
  if (!metadata) return undefined;
  return metadata as RepositoryOptions;
}
