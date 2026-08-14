import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    return null;
  }

  try {
    // Enable connection pooling with postgres-js and disable prefetch for transaction pooler mode
    client = postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    dbInstance = drizzle(client, { schema });
    return dbInstance;
  } catch (error) {
    console.warn('Failed to initialize Drizzle ORM client:', error);
    return null;
  }
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const activeDb = getDb();
    if (!activeDb) {
      return undefined;
    }
    return (activeDb as any)[prop];
  },
});

export * from './schema';
