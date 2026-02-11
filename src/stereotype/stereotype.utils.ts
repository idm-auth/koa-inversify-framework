import { injectable } from 'inversify';

export function createStereotype() {
  return function <T extends new (...args: never[]) => object>(target: T) {
    injectable()(target);
    return target;
  };
}
