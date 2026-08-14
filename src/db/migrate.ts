import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

async function runMigrations() {
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL is not set.');
    console.error('Please configure your database connection string in .env');
    process.exit(1);
  }

  console.log('🚀 Connecting to database for Drizzle ORM migration...');
  
  // Single-connection client for migrations
  const migrationClient = postgres(connectionString, {
    max: 1,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  const db = drizzle(migrationClient);

  try {
    const migrationsFolder = path.join(process.cwd(), 'drizzle');
    console.log(`📦 Applying migrations from: ${migrationsFolder}`);

    await migrate(db, {
      migrationsFolder,
      migrationsTable: '__drizzle_migrations',
      migrationsSchema: 'public',
    });

    console.log('✅ All Drizzle ORM migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
