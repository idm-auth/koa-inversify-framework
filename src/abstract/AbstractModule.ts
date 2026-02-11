import type { Container } from 'inversify';
import { RegisterRouter, RegisterRouterSymbol } from '@/infrastructure/koa/registerRouter.provider';

export abstract class AbstractModule {
  constructor(protected container: Container) {
    this.runBind();
    this.registerController();
  }

  private registerController(): void {
    const controllerSymbol = this.getControllerSymbol();
    if (controllerSymbol) {
      const registerRouter = this.container.get<RegisterRouter>(RegisterRouterSymbol);
      registerRouter.registerController(controllerSymbol, this.container);
    }
  }

  protected abstract runBind(): void;
  abstract getControllerSymbol(): symbol | null;
}
