import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc } from 'drizzle-orm';
import { extractTokenFromRequest, verifyJwtToken } from '@/src/lib/jwtAuth';
import { formatVillage } from '@/src/lib/apiResponse';

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    // 1. Resolve Authenticated User and Permissions
    const token = extractTokenFromRequest(req);
    let authenticatedUser: any = null;
    let userPermissionsList: string[] = [];

    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload) {
        let memberRecord: any = null;
        if (payload.id && !isNaN(Number(payload.id))) {
          memberRecord = await db.query.members.findFirst({
            where: (m, { eq }) => eq(m.id, Number(payload.id)),
            with: {
              village: {
                with: {
                  gramPanchayat: {
                    with: {
                      district: {
                        with: {
                          state: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        } else if (payload.mobile) {
          const cleanMob = payload.mobile.replace(/\D/g, '').slice(-10);
          memberRecord = await db.query.members.findFirst({
            where: (m, { sql }) =>
              sql`RIGHT(REGEXP_REPLACE(${m.mobile}, '\\D', '', 'g'), 10) = ${cleanMob}`,
            with: {
              village: {
                with: {
                  gramPanchayat: {
                    with: {
                      district: {
                        with: {
                          state: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        }

        if (memberRecord) {
          const isSuperAdmin = memberRecord.systemRole === 'SUPER_ADMIN';
          const isAdmin =
            isSuperAdmin ||
            memberRecord.systemRole === 'ADMIN' ||
            memberRecord.role === 'ADMIN';

          // Fetch explicit granted permissions for the member
          const userPerms = await db.query.userPermissions.findMany({
            where: (up, { eq }) => eq(up.memberId, memberRecord.id),
          });

          userPermissionsList = userPerms
            .filter((p) => p.isGranted)
            .map((p) => p.permissionCode);

          authenticatedUser = {
            id: String(memberRecord.id),
            name: memberRecord.name,
            mobile: memberRecord.mobile,
            email: memberRecord.email || '',
            photoUrl: memberRecord.photoUrl || '',
            status: memberRecord.status,
            role: memberRecord.role,
            systemRole: memberRecord.systemRole,
            villageId: memberRecord.villageId ? String(memberRecord.villageId) : '1',
            villageName: memberRecord.village?.name || 'Rasoolpur',
            gramPanchayat: memberRecord.village?.gramPanchayat?.name || 'Bahera',
            district: memberRecord.village?.gramPanchayat?.district?.name || 'Hardoi',
            state: memberRecord.village?.gramPanchayat?.district?.state?.name || 'Uttar Pradesh',
            permissions: userPermissionsList,
            isAdmin,
            isSuperAdmin,
          };
        }
      }
    }

    // 2. Fetch Village Chapters and System Permissions List
    const [villagesData, permissionsData] = await Promise.all([
      db.query.villages.findMany({
        with: {
          gramPanchayat: {
            with: {
              district: {
                with: {
                  state: true,
                },
              },
            },
          },
        },
        orderBy: [asc(schema.villages.id)],
      }),
      db.select().from(schema.permissions).orderBy(asc(schema.permissions.code)),
    ]);

    const formattedVillages = villagesData.map(formatVillage).filter(Boolean);
    const activeVillage =
      formattedVillages.find((v) => v.id === authenticatedUser?.villageId) ||
      formattedVillages[0] ||
      null;

    const isSuperAdmin = Boolean(authenticatedUser?.isSuperAdmin || authenticatedUser?.systemRole === 'SUPER_ADMIN');
    const isAdm = Boolean(isSuperAdmin || authenticatedUser?.isAdmin || authenticatedUser?.systemRole === 'ADMIN');

    return NextResponse.json({
      success: true,
      authenticated: Boolean(authenticatedUser),
      user: authenticatedUser,
      role: authenticatedUser?.systemRole || (isSuperAdmin ? 'SUPER_ADMIN' : isAdm ? 'ADMIN' : authenticatedUser ? 'MEMBER' : 'GUEST'),
      systemRole: authenticatedUser?.systemRole || (isSuperAdmin ? 'SUPER_ADMIN' : 'GUEST'),
      isAdmin: isAdm,
      isSuperAdmin: isSuperAdmin,
      userPermissions: isSuperAdmin ? permissionsData.map((p) => p.code) : userPermissionsList,
      permissions: permissionsData,
      villageSettings: activeVillage,
      villages: formattedVillages,
      access: {
        canAccessAdmin: isAdm,
        canManageMembers: isSuperAdmin || isAdm || userPermissionsList.includes('members:approve'),
        canManageComplaints: isSuperAdmin || isAdm || userPermissionsList.includes('complaints:view'),
        canManageSocialWorks: isSuperAdmin || isAdm || userPermissionsList.includes('social_work:create'),
        canManageEvents: isSuperAdmin || isAdm || userPermissionsList.includes('events:create'),
        canManageGallery: isSuperAdmin || isAdm || userPermissionsList.includes('gallery:upload'),
        canManageAnnouncements: isSuperAdmin || isAdm || userPermissionsList.includes('announcements:create'),
        canManageVillages: isSuperAdmin,
        canManageElders: isSuperAdmin || isAdm,
        canManagePublicInfo: isSuperAdmin || isAdm,
        canManageIntegrations: isSuperAdmin,
        canManagePermissions: isSuperAdmin,
        canAccessAuditLogs: isSuperAdmin || isAdm,
        canAccessAllModules: isSuperAdmin,
      },
    });
  } catch (error: any) {
    console.error('Error fetching access data in /api/data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch access data' },
      { status: 500 }
    );
  }
}
