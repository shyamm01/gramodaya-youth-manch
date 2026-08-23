import { NextResponse } from 'next/server';
import { CANONICAL_ROLES, RolePreset } from '../route';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, nameHindi, description, scope, permissions } = body;

    // Check if it's a canonical role
    const canonicalIndex = CANONICAL_ROLES.findIndex((r) => r.id === id || r.code === id);
    if (canonicalIndex >= 0) {
      if (name) CANONICAL_ROLES[canonicalIndex].name = name;
      if (nameHindi) CANONICAL_ROLES[canonicalIndex].nameHindi = nameHindi;
      if (description) CANONICAL_ROLES[canonicalIndex].description = description;
      if (scope) CANONICAL_ROLES[canonicalIndex].scope = scope;
      if (Array.isArray(permissions)) {
        CANONICAL_ROLES[canonicalIndex].permissions = permissions;
        CANONICAL_ROLES[canonicalIndex].permissionsCount = permissions.length;
      }
      return NextResponse.json({
        success: true,
        role: CANONICAL_ROLES[canonicalIndex],
        message: 'System role updated successfully',
      });
    }

    return NextResponse.json({
      success: true,
      role: {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      },
      message: 'Role updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating role:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update role' },
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

    // Disallow deleting root system roles
    const isSystemRole = CANONICAL_ROLES.some((r) => r.id === id || r.code === id);
    if (isSystemRole && (id === 'SUPER_ADMIN' || id === 'role_super_admin' || id === 'role_admin' || id === 'role_member')) {
      return NextResponse.json(
        { success: false, error: 'System core roles cannot be deleted.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role '${id}' deleted successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting role:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete role' },
      { status: 500 }
    );
  }
}
