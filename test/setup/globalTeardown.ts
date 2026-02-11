import mongoose from 'mongoose';
import { DefaultEnv } from '@/infrastructure/env/defaultEnv.provider';
import { EnvKey } from '@/common/env.types';

let teardownHappened = false;

export async function teardown() {
  if (teardownHappened) {
    throw new Error('[Global Teardown] teardown called twice');
  }

  const env = new DefaultEnv();
  const mongoUri = env.get(EnvKey.MONGODB_URI);
  const connection = await mongoose.createConnection(mongoUri).asPromise();

  if (!connection.db) {
    throw new Error('[Global Teardown] connection.db is undefined');
  }

  const admin = connection.db.admin();
  const { databases } = await admin.listDatabases();
  console.log('[Global Teardown] Cleaning test databases...');
  for (const db of databases) {
    if (db.name.startsWith('vi-test-db')) {
      await connection.useDb(db.name).dropDatabase();
    }
  }
  await connection.close();
  console.log('[Global Teardown] Cleanup completed\n');
  teardownHappened = true;
}
