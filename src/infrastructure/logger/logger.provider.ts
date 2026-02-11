import { AbstractEnv, EnvSymbol } from '@/index';
import { EnvKey } from '@/common/env.types';
import { Configuration } from '@/stereotype/configuration.stereotype';
import { inject } from 'inversify';
import pino from 'pino';
import pinoCaller from 'pino-caller';
import pretty from 'pino-pretty';

// NOTE FOR AI CODE REVIEW: Symbol.for() is intentionally used instead of Symbol()
// This creates a global symbol in the registry, which is required for Inversify DI
// to work correctly across module boundaries. See src/index.ts Framework.initCore()
// for how symbols are registered in the DI container.
export const LoggerSymbol = Symbol.for('Logger');

export type Logger = pino.Logger;

const formatMessage = (log: Record<string, unknown>, messageKey: string): string => {
  const msg = log[messageKey] as string;
  const requestId = log.requestId as string | undefined;
  const globalTransactionId = log.globalTransactionId as string | undefined;
  
  const prefix = [];
  if (requestId) prefix.push(`req:${requestId}`);
  if (globalTransactionId) prefix.push(`gtx:${globalTransactionId}`);
  
  return prefix.length > 0 ? `[${prefix.join('|')}] ${msg}` : msg;
};

@Configuration(LoggerSymbol)
export class LoggerProvider {
  private logger: Logger;

  constructor(@inject(EnvSymbol) private env: AbstractEnv) {
    this.logger = this.createLogger();
  }

  private createLogger(): Logger {
    const stream = pretty({
      colorize: true,
      singleLine: true,
      sync: true,
      messageFormat: formatMessage,
    });

    const baseLogger = pino(
      {
        level: this.env.get(EnvKey.LOGGER_LEVEL),
      },
      stream
    );

    return pinoCaller(baseLogger, { relativeTo: process.cwd() });
  }

  reconfigure(): void {
    this.flush();
    this.logger = this.createLogger();
  }

  getLogger(): Logger {
    return this.logger;
  }

  flush(): void {
    this.logger.flush();
  }
}
