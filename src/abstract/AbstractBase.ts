import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { getStereotypeIdentity } from '@/stereotype/stereotype.metadata';
import { inject } from 'inversify';

/**
 * AbstractBase - Base class for all framework abstractions
 * 
 * Provides common infrastructure:
 * - Logger with stereotype context
 * 
 * Extended by:
 * - AbstractController
 * - AbstractService
 * - AbstractRepository
 * - AbstractMapper
 */
export abstract class AbstractBase {
  @inject(LoggerSymbol)
  protected loggerProvider!: LoggerProvider;

  private _log?: ReturnType<LoggerProvider['getLogger']>;

  protected get log() {
    if (!this._log) {
      const identity = getStereotypeIdentity(this.constructor);
      const stereotype = identity?.symbol.description ?? this.constructor.name;
      this._log = this.loggerProvider.getLogger().child({ stereotype });
    }
    return this._log;
  }
}
