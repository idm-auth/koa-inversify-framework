import { createStereotype } from '@/stereotype/stereotype.utils';
import { setStereotypeIdentity, StereotypeType } from '@/stereotype/stereotype.metadata';
import { injectFromHierarchy } from 'inversify';

export function Configuration(symbol: symbol) {
  const baseDecorator = createStereotype();
  const injectFromHierarchyDecorator = injectFromHierarchy({
    extendProperties: true,
  });

  return function <T extends new (...args: never[]) => object>(target: T): T {
    setStereotypeIdentity(target, symbol, StereotypeType.Configuration);
    
    const decoratedTarget = baseDecorator(target);
    const final = injectFromHierarchyDecorator(decoratedTarget);
    
    return final ?? decoratedTarget;
  };
}
