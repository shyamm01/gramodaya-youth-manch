import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc } from 'drizzle-orm';

export interface AuditLogItem {
  id: number | string;
  villageId?: number | null;
  villageName?: string;
  userId?: string | null;
  userName: string;
  userRole?: string;
  userContact?: string | null;
  action: string;
  details?: string | null;
  targetEntity?: string | null;
  targetUser?: string | null;
  ipAddress?: string | null;
  timestamp: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_super_01',
    userName: 'Shyam Varan Pal',
    userRole: 'SUPER_ADMIN',
    userContact: '9506072678',
    action: 'POLICY_PERMISSIONS_UPDATE',
    details: 'Updated granular PBAC capability matrix for Village Admin role across 13 modules.',
    targetEntity: 'Role: ADMIN',
    targetUser: 'Village Administrators',
    ipAddress: '103.21.124.89',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    severity: 'INFO',
  },
  {
    id: 2,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_admin_02',
    userName: 'Ramesh Kumar',
    userRole: 'ADMIN',
    userContact: '9876500001',
    action: 'PROFILE_UPDATED',
    details: 'Updated personal profile data, designation (Panchayat Coordinator), and emergency contact for Suresh Yadav.',
    targetEntity: 'Profile: Suresh Yadav',
    targetUser: 'Suresh Yadav',
    ipAddress: '157.34.89.12',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: 'SUCCESS',
  },
  {
    id: 3,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_admin_02',
    userName: 'Ramesh Kumar',
    userRole: 'ADMIN',
    userContact: '9876500001',
    action: 'MEMBER_VERIFIED',
    details: 'Approved member verification and KYC for citizen Amit Sharma (Mobile: 9876543211).',
    targetEntity: 'Profile: Amit Sharma',
    targetUser: 'Amit Sharma',
    ipAddress: '157.34.89.12',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    severity: 'SUCCESS',
  },
  {
    id: 4,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_admin_02',
    userName: 'Ramesh Kumar',
    userRole: 'ADMIN',
    userContact: '9876500001',
    action: 'GRIEVANCE_STATUS_UPDATE',
    details: 'Changed status of complaint #104 (Solar street light repair) to IN_PROGRESS.',
    targetEntity: 'Grievance #104',
    targetUser: 'Grievance: Solar Light Repair',
    ipAddress: '157.34.89.12',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    severity: 'INFO',
  },
  {
    id: 5,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_super_01',
    userName: 'Shyam Varan Pal',
    userRole: 'SUPER_ADMIN',
    userContact: '9506072678',
    action: 'MODULE_RUNTIME_TOGGLE',
    details: 'Enabled runtime access for Live Chat & Community Discussions module.',
    targetEntity: 'Module: live_chat',
    targetUser: 'Module: live_chat',
    ipAddress: '103.21.124.89',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    severity: 'INFO',
  },
  {
    id: 6,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_sec_01',
    userName: 'System Security Engine',
    userRole: 'SYSTEM',
    userContact: 'Internal Service',
    action: 'AUTH_SESSION_LOGIN',
    details: 'Successful administrator login via OTP authentication.',
    targetEntity: 'Auth Session',
    targetUser: 'Shyam Varan Pal',
    ipAddress: '103.21.124.89',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    severity: 'SUCCESS',
  },
  {
    id: 7,
    villageId: 1,
    villageName: 'Rasoolpur',
    userId: 'u_sec_01',
    userName: 'System Security Engine',
    userRole: 'SYSTEM',
    userContact: 'Internal Service',
    action: 'RATE_LIMIT_NOTICE',
    details: 'Excessive rapid requests detected and throttled for IP 49.207.18.91.',
    targetEntity: 'Firewall Filter',
    targetUser: 'IP 49.207.18.91',
    ipAddress: '49.207.18.91',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    severity: 'WARNING',
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const actionFilter = searchParams.get('action');
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit')) || 50;

    const db = getDb();
    if (!db) {
      let filtered = [...SEED_AUDIT_LOGS];
      if (actionFilter && actionFilter !== 'ALL') {
        filtered = filtered.filter((l) => l.action.includes(actionFilter));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.userName.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            (l.details || '').toLowerCase().includes(q) ||
            (l.userRole || '').toLowerCase().includes(q) ||
            (l.targetUser || '').toLowerCase().includes(q) ||
            (l.targetEntity || '').toLowerCase().includes(q) ||
            (l.ipAddress || '').includes(q)
        );
      }
      return NextResponse.json({
        success: true,
        logs: filtered.slice(0, limit),
        total: filtered.length,
        source: 'in_memory_catalog',
      });
    }

    // Query database
    let query = db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(limit);

    let dbLogs = await query;

    // Auto-seed if empty
    if (dbLogs.length === 0) {
      try {
        const seedPayload = SEED_AUDIT_LOGS.map((item) => ({
          userName: item.userName,
          action: item.action,
          details: item.details || '',
          ipAddress: item.ipAddress || '127.0.0.1',
          timestamp: new Date(item.timestamp),
        }));
        await db.insert(schema.auditLogs).values(seedPayload);
        dbLogs = await db
          .select()
          .from(schema.auditLogs)
          .orderBy(desc(schema.auditLogs.timestamp))
          .limit(limit);
      } catch (seedErr) {
        console.warn('Auto-seed audit logs warning:', seedErr);
      }
    }

    const enrichedLogs: AuditLogItem[] = (dbLogs.length > 0 ? dbLogs : SEED_AUDIT_LOGS).map((item: any) => {
      const actionUpper = (item.action || '').toUpperCase();
      let severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' = 'INFO';
      if (actionUpper.includes('WARNING') || actionUpper.includes('ALERT') || actionUpper.includes('FAIL')) {
        severity = 'WARNING';
      } else if (actionUpper.includes('DELETE') || actionUpper.includes('REVOKE') || actionUpper.includes('REMOVE')) {
        severity = 'CRITICAL';
      } else if (actionUpper.includes('SUCCESS') || actionUpper.includes('APPROVE') || actionUpper.includes('VERIF') || actionUpper.includes('UPDATE')) {
        severity = 'SUCCESS';
      }

      const isSuper = item.userName?.includes('Shyam') || item.userName?.includes('Super');
      const isSys = item.userName?.includes('System') || item.userName?.includes('Security');

      // Detect target user name from details if not explicit
      let detectedTargetUser = item.targetUser || null;
      let detectedTargetEntity = item.targetEntity || null;

      if (!detectedTargetUser && item.details) {
        if (item.details.includes('for Suresh Yadav')) {
          detectedTargetUser = 'Suresh Yadav';
          detectedTargetEntity = 'Profile: Suresh Yadav';
        } else if (item.details.includes('Amit Sharma')) {
          detectedTargetUser = 'Amit Sharma';
          detectedTargetEntity = 'Profile: Amit Sharma';
        } else if (item.details.includes('Sunita Devi')) {
          detectedTargetUser = 'Sunita Devi';
          detectedTargetEntity = 'Profile: Sunita Devi';
        } else if (item.action === 'PROFILE_UPDATED') {
          const match = item.details.match(/for ([^.\n]+)/i);
          if (match && match[1]) {
            detectedTargetUser = match[1].trim();
            detectedTargetEntity = `Profile: ${detectedTargetUser}`;
          }
        }
      }

      return {
        id: item.id,
        villageId: item.villageId || 1,
        villageName: 'Rasoolpur',
        userId: item.userId || null,
        userName: item.userName || 'Administrator',
        userRole: isSuper ? 'SUPER_ADMIN' : isSys ? 'SYSTEM' : 'ADMIN',
        userContact: isSuper ? '9506072678' : isSys ? 'Internal Daemon' : '9876500001',
        action: item.action,
        details: item.details,
        targetEntity: detectedTargetEntity || (item.action.includes('PROFILE') ? 'Member Profile' : item.targetEntity || null),
        targetUser: detectedTargetUser || null,
        ipAddress: item.ipAddress || '127.0.0.1',
        timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString(),
        severity,
      };
    });

    let filtered = enrichedLogs;
    if (actionFilter && actionFilter !== 'ALL') {
      filtered = filtered.filter((l) => l.action.includes(actionFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.details || '').toLowerCase().includes(q) ||
          (l.userRole || '').toLowerCase().includes(q) ||
          (l.targetUser || '').toLowerCase().includes(q) ||
          (l.targetEntity || '').toLowerCase().includes(q) ||
          (l.ipAddress || '').includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      logs: filtered,
      total: filtered.length,
      source: dbLogs.length > 0 ? 'database' : 'seeded',
    });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName, userRole, userContact, action, details, targetEntity, targetUser, ipAddress, villageId, userId } = body;

    if (!userName || !action) {
      return NextResponse.json(
        { success: false, error: 'User name and action are required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      const newEntry: AuditLogItem = {
        id: Date.now(),
        userName,
        userRole: userRole || 'ADMIN',
        userContact: userContact || null,
        action,
        details: details || null,
        targetEntity: targetEntity || null,
        targetUser: targetUser || null,
        ipAddress: ipAddress || '127.0.0.1',
        villageId: villageId || 1,
        userId: userId || null,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      };
      SEED_AUDIT_LOGS.unshift(newEntry);
      return NextResponse.json({ success: true, log: newEntry });
    }

    const [created] = await db
      .insert(schema.auditLogs)
      .values({
        userName,
        action,
        details: details || '',
        ipAddress: ipAddress || '127.0.0.1',
        villageId: villageId ? Number(villageId) : null,
        userId: userId || null,
        timestamp: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      log: {
        ...created,
        userRole: userRole || 'ADMIN',
        targetEntity,
        targetUser,
      },
      message: 'Audit log entry created',
    });
  } catch (err: any) {
    console.error('Error inserting audit log:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
