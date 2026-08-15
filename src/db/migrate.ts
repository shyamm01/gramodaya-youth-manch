import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: '.env.local' });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

async function runDrizzleMigrations() {
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL is not set.');
    console.error('Please configure your database connection string in .env or .env.local');
    process.exit(1);
  }

  console.log('🚀 Connecting to PostgreSQL database...');

  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(sql);

  try {
    console.log('📦 Executing all Drizzle migrations from ./drizzle ...');
    const migrationsFolder = path.join(process.cwd(), 'drizzle');

    await migrate(db, {
      migrationsFolder,
      migrationsTable: '__drizzle_migrations',
      migrationsSchema: 'public',
    });

    console.log('✅ SUCCESS! All Drizzle migrations executed and synced with the database.');
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runDrizzleMigrations();
