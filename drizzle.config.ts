import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:54322/postgres';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
