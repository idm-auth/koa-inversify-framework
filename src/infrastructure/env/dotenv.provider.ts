import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

if (process.env.NODE_ENV === 'development') {
  config({ path: path.resolve(process.cwd(), '.env.development.local') });
}

if (process.env.NODE_ENV === 'test') {
  config({ path: path.resolve(process.cwd(), '.env.test') });
}

export { config };
