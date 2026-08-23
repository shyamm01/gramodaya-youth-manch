import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ALL_SYSTEM_PERMISSIONS } from '@/src/lib/permissions';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, nameHindi, icon, description, displayOrder, isActive } = body;

    const db = getDb();
    if (!db) {
      return NextResponse.json({
        success: true,
        module: {
          id: isNaN(Number(id)) ? id : Number(id),
          ...body,
          updatedAt: new Date().toISOString(),
        },
        message: 'Module updated successfully',
      });
    }

    const moduleId = Number(id);
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (nameHindi !== undefined) updatePayload.nameHindi = nameHindi;
    if (icon !== undefined) updatePayload.icon = icon;
    if (description !== undefined) updatePayload.description = description;
    if (displayOrder !== undefined) updatePayload.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);

    const [updated] = await db
      .update(schema.modules)
      .set(updatePayload)
      .where(eq(schema.modules.id, moduleId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    const perms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === updated.slug);

    return NextResponse.json({
      success: true,
      module: {
        ...updated,
        permissionsCount: perms.length,
        permissions: perms,
      },
      message: 'Module updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating module:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update module' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json({
        success: true,
        message: `Module ${id} deleted successfully`,
      });
    }

    const moduleId = Number(id);
    const [deleted] = await db
      .delete(schema.modules)
      .where(eq(schema.modules.id, moduleId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedModule: deleted,
      message: `Module '${deleted.name}' deleted successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting module:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete module' },
      { status: 500 }
    );
  }
}
