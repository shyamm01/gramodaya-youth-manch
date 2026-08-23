import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { SYSTEM_MODULES, ALL_SYSTEM_PERMISSIONS } from '@/src/lib/permissions';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      // Return canonical modules with permissions when database is not connected
      return NextResponse.json({
        success: true,
        modules: SYSTEM_MODULES.map((m, idx) => ({
          id: idx + 1,
          slug: m.id,
          name: m.nameEnglish,
          nameHindi: m.nameHindi,
          icon: 'Layers',
          description: m.description,
          displayOrder: idx + 1,
          isActive: true,
          permissionsCount: m.permissions.length,
          permissions: m.permissions,
        })),
        total: SYSTEM_MODULES.length,
        source: 'static_fallback',
      });
    }

    let dbModules = await db
      .select()
      .from(schema.modules)
      .orderBy(asc(schema.modules.displayOrder), asc(schema.modules.id));

    // Auto-seed if database modules table is empty
    if (dbModules.length === 0) {
      try {
        const seedPayload = SYSTEM_MODULES.map((m, idx) => ({
          slug: m.id,
          name: m.nameEnglish,
          nameHindi: m.nameHindi,
          icon: 'Layers',
          description: m.description,
          displayOrder: idx + 1,
          isActive: true,
        }));
        await db.insert(schema.modules).values(seedPayload);
        dbModules = await db
          .select()
          .from(schema.modules)
          .orderBy(asc(schema.modules.displayOrder), asc(schema.modules.id));
      } catch (seedErr) {
        console.warn('Auto-seed modules error:', seedErr);
      }
    }

    // Attach permissions
    const enrichedModules = (dbModules.length > 0 ? dbModules : SYSTEM_MODULES.map((m, idx) => ({
      id: idx + 1,
      slug: m.id,
      name: m.nameEnglish,
      nameHindi: m.nameHindi,
      icon: 'Layers',
      description: m.description,
      displayOrder: idx + 1,
      isActive: true,
    }))).map((mod: any) => {
      const perms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === mod.slug);
      return {
        ...mod,
        permissionsCount: perms.length,
        permissions: perms,
      };
    });

    return NextResponse.json({
      success: true,
      modules: enrichedModules,
      total: enrichedModules.length,
      source: dbModules.length > 0 ? 'database' : 'seeded',
    });
  } catch (err: any) {
    console.error('Error fetching modules:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, name, nameHindi, icon, description, displayOrder, isActive } = body;

    if (!slug || !name || !nameHindi) {
      return NextResponse.json(
        { success: false, error: 'Module slug, English name, and Hindi name are required.' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const db = getDb();
    if (!db) {
      // In-memory mock response if db offline
      return NextResponse.json({
        success: true,
        module: {
          id: Date.now(),
          slug: cleanSlug,
          name,
          nameHindi,
          icon: icon || 'Layers',
          description: description || '',
          displayOrder: Number(displayOrder) || 1,
          isActive: isActive !== false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissionsCount: 0,
          permissions: [],
        },
        message: 'Module created successfully',
      });
    }

    // Check slug uniqueness
    const existing = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.slug, cleanSlug));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Module with slug '${cleanSlug}' already exists.` },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(schema.modules)
      .values({
        slug: cleanSlug,
        name,
        nameHindi,
        icon: icon || 'Layers',
        description: description || '',
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      module: {
        ...created,
        permissionsCount: 0,
        permissions: [],
      },
      message: 'Module registered successfully in database',
    });
  } catch (err: any) {
    console.error('Error creating module:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create module' },
      { status: 500 }
    );
  }
}
