import postgres from 'postgres';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { seedDatabase } from './seed';

dotenv.config();
dotenv.config({ path: '.env.local' });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

export async function resetDatabase() {
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL is not set.');
    process.exit(1);
  }

  console.log('🧹 Connecting to PostgreSQL database to clear all data...');

  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🗑️  Truncating all existing database tables (CASCADE)...');

    const tableNames = [
      'chat_messages',
      'chat_members',
      'chat_rooms',
      'messages',
      'group_messages',
      'audit_logs',
      'public_infos',
      'elders',
      'gallery',
      'events',
      'social_works',
      'complaints',
      'user_permissions',
      'user_village_roles',
      'members',
      'profiles',
      'villages',
      'gram_panchayats',
      'districts',
      'states',
      'permissions',
    ];

    for (const table of tableNames) {
      try {
        await sql.unsafe(`TRUNCATE TABLE public.${table} CASCADE;`);
        console.log(`  ✓ Cleared table: ${table}`);
      } catch (err: any) {
        if (err.code === '42P01') {
          // Table doesn't exist yet, skip
          console.log(`  ℹ Table ${table} does not exist, skipping.`);
        } else {
          console.warn(`  ⚠️ Warning on table ${table}:`, err.message);
        }
      }
    }

    console.log('✨ All database tables have been cleared.');

    // Clear local data_store.json if present
    const dataStorePath = path.join(process.cwd(), 'data_store.json');
    if (fs.existsSync(dataStorePath)) {
      try {
        fs.unlinkSync(dataStorePath);
        console.log('  ✓ Removed local data_store.json file for fresh start.');
      } catch (err) {
        console.warn('  ⚠️ Could not delete data_store.json:', err);
      }
    }

    // Seed fresh baseline data
    console.log('\n🌱 Seeding fresh initial data (3NF hierarchy & canonical permissions)...');
    await seedDatabase();

    console.log('\n🎉 Fresh database setup complete! Database is clean and ready.');
  } catch (error: any) {
    console.error('❌ Failed to reset database:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

if (import.meta.main || process.argv[1]?.endsWith('reset.ts')) {
  resetDatabase()
    .then(() => {
      console.log('Database reset script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database reset failed:', err);
      process.exit(1);
    });
}
