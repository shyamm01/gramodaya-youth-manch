import { getDb } from './index';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

async function truncateAllUsers() {
  console.log('🧹 Purging all users of any role from database...');
  const db = getDb();

  if (!db) {
    console.error('❌ Database connection not configured. Check DATABASE_URL in .env/.env.local');
    process.exit(1);
  }

  try {
    // Truncate all user-related tables with CASCADE
    await db.execute(sql`
      TRUNCATE TABLE 
        public.user_permissions,
        public.user_village_roles,
        public.members
      RESTART IDENTITY CASCADE;
    `);

    console.log('✅ All users removed. Tables public.members, public.user_village_roles, public.user_permissions are now empty.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error truncating user tables:', error);
    process.exit(1);
  }
}

truncateAllUsers();
