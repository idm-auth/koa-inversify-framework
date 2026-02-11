import { EnvKey } from '@/common/env.types';
import { AbstractEnv, EnvSymbol } from '@/index';
import { ILifecycle } from '@/infrastructure/core/core.interface';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { Configuration } from '@/stereotype/configuration.stereotype';
import { inject } from 'inversify';
import mongoose, { Connection } from 'mongoose';

export const MongoDBSymbol = Symbol.for('MongoDB');

@Configuration(MongoDBSymbol)
export class MongoDB implements ILifecycle {
  private connection: Connection | null = null;

  constructor(
    @inject(LoggerSymbol) private loggerProvider: LoggerProvider,
    @inject(EnvSymbol) private env: AbstractEnv
  ) {}

  private get logger() {
    return this.loggerProvider.getLogger();
  }

  async init(): Promise<void> {
    const uri = this.env.get(EnvKey.MONGODB_URI);
    this.connection = await mongoose
      .createConnection(uri, {
        writeConcern: { w: 'majority', journal: true },
      })
      .asPromise();

    if (this.env.get(EnvKey.NODE_ENV) === 'development') {
      this.connection.on('open', () => {
        this.logger.debug(
          { connectionId: this.connection?.id },
          'MongoDB connection opened'
        );
      });

      mongoose.connection.on('createConnection', (conn: Connection) => {
        this.logger.debug(
          { connectionId: conn.id, db: conn.name },
          'MongoDB connection created'
        );
      });
    }
  }

  async shutdown(): Promise<void> {
    if (!this.connection) return;

    if (this.env.get(EnvKey.NODE_ENV) === 'development') {
      const openConnections = mongoose.connections.filter(
        (c: Connection) => c.readyState === mongoose.ConnectionStates.connected
      );
      this.logger.debug(
        { count: openConnections.length },
        'Closing MongoDB connections'
      );
      openConnections.forEach((c: Connection) =>
        this.logger.debug({ connectionId: c.id, db: c.name }, 'Open connection')
      );
    }

    await this.connection.close();
    this.connection = null;
  }

  getConn(): Connection {
    if (!this.connection) throw new Error('Connection not initialized');
    return this.connection;
  }

  getDbConn(dbName: string): Connection {
    const db = this.getConn().useDb(dbName, { useCache: true });
    if (this.env.get(EnvKey.NODE_ENV) === 'development') {
      this.logger.debug({ db: dbName }, 'useDb called (cached)');
    }
    return db;
  }

  async dropDatabase(dbName: string): Promise<void> {
    this.logger.debug({ dbName }, 'Dropping database');
    const conn = this.getConn();
    await conn.useDb(dbName).dropDatabase();
    this.logger.info({ dbName }, 'Database dropped');
  }
}
