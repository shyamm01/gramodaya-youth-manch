import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Admin,
  Member,
  Complaint,
  SocialWork,
  PublicInfo,
  Announcement,
  EventItem,
  GalleryItem,
  Elder,
  AuditLog,
  ApiIntegration,
  ChatMessage,
  GroupMessage,
  VillageSettings,
  Village,
  UserPermission,
  UserVillageRole,
} from '../types';
import { getServerSupabase, syncToSupabase } from './supabaseServer';

export const DEFAULT_VILLAGE_SETTINGS: VillageSettings = {
  id: 'vil_rasoolpur',
  slug: 'rasoolpur',
  name: 'RASOOLPUR',
  nameHindi: 'रसूलपुर',
  gramPanchayat: 'BAHERA',
  gramPanchayatHindi: 'बहेरा',
  district: 'Jaunpur',
  districtHindi: 'जौनपुर',
  state: 'Uttar Pradesh',
  stateHindi: 'उत्तर प्रदेश',
  taglineHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
  sloganHindi: 'युवा शक्ति से ग्रामोदय की ओर।',
  orgName: 'GRAMODAYA YOUTH MANCH',
  orgNameHindi: '🌱 ग्रामोदय यूथ मंच 🌱',
  orgPurposeHindi:
    'ग्रामोदय यूथ मंच गांव के युवाओं, परिवारों और बुजुर्गों को एक साथ जोड़कर ग्राम विकास, शिक्षा, रोजगार, स्वच्छता, पर्यावरण, सामाजिक जागरूकता और जरूरतमंद लोगों की सहायता के लिए कार्य करने का एक सामुदायिक मंच है।',
};

export interface Store {
  villageSettings: VillageSettings;
  villages: Village[];
  userPermissions: UserPermission[];
  userVillageRoles: UserVillageRole[];
  admins: Admin[];
  members: Member[];
  complaints: Complaint[];
  socialWorks: SocialWork[];
  publicInfos: PublicInfo[];
  announcements: Announcement[];
  events: EventItem[];
  gallery: GalleryItem[];
  elders: Elder[];
  auditLogs: AuditLog[];
  apiIntegrations: ApiIntegration[];
  messages: ChatMessage[];
  groupMessages: GroupMessage[];
  adminPasswords: Record<string, string>; // mobile/id -> password hash
  memberPasswords?: Record<string, string>; // mobile/id -> password hash
}

const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Global store memory cache
let cachedStore: Store | null = null;

// OTP Store in memory: mobile -> { otp: string, expires: number, resetToken?: string }
const globalOtpStore = new Map<string, { otp: string; expires: number; resetToken?: string }>();

export function normalizeMobile(mob: string): string {
  if (!mob) return '';
  return mob.replace(/\D/g, '').slice(-10);
}

export function isAuthorizedAdminMobile(mob: string): boolean {
  const digits = normalizeMobile(mob);
  if (!digits) return false;
  const store = loadStore();

  const isAdminInList = (store.admins || []).some(
    (a) => normalizeMobile(a.mobile) === digits
  );
  const isMemberAdmin = (store.members || []).some(
    (m: any) =>
      (m.role === 'ADMIN' || m.role === 'SUPER_ADMIN') &&
      normalizeMobile(m.mobile) === digits
  );

  return isAdminInList || isMemberAdmin;
}

export function isApprovedUser(mob?: string): boolean {
  if (!mob) return false;
  const digits = normalizeMobile(mob);
  if (!digits) return false;
  const store = loadStore();

  if (isAuthorizedAdminMobile(mob)) return true;

  const member = (store.members || []).find((m) => normalizeMobile(m.mobile) === digits);
  return member ? member.status === 'active' : false;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

export function loadStore(): Store {
  if (cachedStore) return cachedStore;

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      cachedStore = {
        villageSettings: parsed.villageSettings || DEFAULT_VILLAGE_SETTINGS,
        villages: parsed.villages || [
          {
            id: 'vil_rasoolpur',
            slug: 'rasoolpur',
            name: 'Rasoolpur',
            nameHindi: 'रसूलपुर',
            gramPanchayatName: 'Bahera',
            gramPanchayatNameHindi: 'बहेरा',
            districtName: 'Jaunpur',
            orgName: 'Gramodaya Youth Manch',
            orgNameHindi: 'ग्रामोदय यूथ मंच',
            sloganHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
            taglineHindi: 'युवा शक्ति से ग्रामोदय की ओर',
            isActive: true,
          },
        ],
        userPermissions: parsed.userPermissions || [],
        userVillageRoles: parsed.userVillageRoles || [],
        admins: parsed.admins || [],
        members: parsed.members || [],
        complaints: parsed.complaints || [],
        socialWorks: parsed.socialWorks || [],
        publicInfos: parsed.publicInfos || [],
        announcements: parsed.announcements || [],
        events: parsed.events || [],
        gallery: parsed.gallery || [],
        elders: parsed.elders || [],
        auditLogs: parsed.auditLogs || [],
        apiIntegrations: parsed.apiIntegrations || [],
        messages: parsed.messages || [],
        groupMessages: parsed.groupMessages || [],
        adminPasswords: parsed.adminPasswords || {},
        memberPasswords: parsed.memberPasswords || {},
      };
      return cachedStore;
    } catch (e) {
      console.error('Failed to parse data_store.json file, re-initializing...', e);
    }
  }

  const initialIntegrations: ApiIntegration[] = [
    {
      id: 'int_1',
      name: 'Gemini AI',
      status: process.env.GEMINI_API_KEY ? 'Connected' : 'Not Connected',
      keyMasked: process.env.GEMINI_API_KEY ? 'gemini_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'int_supabase',
      name: 'Supabase',
      status: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) ? 'Connected' : 'Not Connected',
      keyMasked: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) ? 'supabase_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'int_2',
      name: 'Razorpay',
      status: process.env.RAZORPAY_KEY_ID ? 'Connected' : 'Not Connected',
      keyMasked: process.env.RAZORPAY_KEY_ID ? 'rzp_test_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'int_3',
      name: 'Firebase',
      status: process.env.FIREBASE_PROJECT_ID ? 'Connected' : 'Not Connected',
      keyMasked: process.env.FIREBASE_PROJECT_ID ? 'firebase_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'int_4',
      name: 'SMS / OTP',
      status: (process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID) ? 'Connected' : 'Not Connected',
      keyMasked: (process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID) ? 'sms_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'int_5',
      name: 'Google Maps',
      status: (process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? 'Connected' : 'Not Connected',
      keyMasked: (process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? 'maps_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'int_6',
      name: 'Cloudinary',
      status: process.env.CLOUDINARY_URL ? 'Connected' : 'Not Connected',
      keyMasked: process.env.CLOUDINARY_URL ? 'cloudinary_••••••••' : 'Not Configured',
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultStore: Store = {
    villageSettings: DEFAULT_VILLAGE_SETTINGS,
    villages: [
      {
        id: 'vil_rasoolpur',
        slug: 'rasoolpur',
        name: 'Rasoolpur',
        nameHindi: 'रसूलपुर',
        gramPanchayatName: 'Bahera',
        gramPanchayatNameHindi: 'बहेरा',
        districtName: 'Jaunpur',
        orgName: 'Gramodaya Youth Manch',
        orgNameHindi: 'ग्रामोदय यूथ मंच',
        sloganHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
        taglineHindi: 'युवा शक्ति से ग्रामोदय की ओर',
        isActive: true,
      },
    ],
    userPermissions: [],
    userVillageRoles: [],
    admins: [],
    members: [],
    complaints: [],
    socialWorks: [],
    publicInfos: [],
    announcements: [],
    events: [],
    gallery: [],
    elders: [],
    auditLogs: [],
    apiIntegrations: initialIntegrations,
    messages: [],
    groupMessages: [],
    adminPasswords: {},
    memberPasswords: {},
  };

  cachedStore = defaultStore;
  return defaultStore;
}

export function saveStore(store: Store): void {
  try {
    cachedStore = store;
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write store file:', e);
  }
}

export function logAuditAction(
  action: string,
  adminName: string = 'Admin',
  adminMobile: string = '',
  recordAffected: string = 'System Record'
): void {
  const store = loadStore();
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    action,
    adminName: adminName || 'Admin',
    adminMobile: adminMobile || '',
    recordAffected: recordAffected || 'System Record',
    timestamp: new Date().toISOString(),
  };
  store.auditLogs.unshift(newLog);
  if (store.auditLogs.length > 300) {
    store.auditLogs = store.auditLogs.slice(0, 300);
  }
  saveStore(store);

  // Background sync audit log to Supabase
  syncToSupabase('audit_logs', {
    id: newLog.id,
    action: newLog.action,
    admin_name: newLog.adminName,
    admin_mobile: newLog.adminMobile,
    record_affected: newLog.recordAffected,
    timestamp: newLog.timestamp,
  });
}

export function getOtpStore() {
  return globalOtpStore;
}

/**
 * Full sync utility to push local datastore to Supabase
 */
export async function syncAllDatastoreToSupabase(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { success: false, syncedCount: 0, error: 'Supabase server client not configured.' };
  }

  const store = loadStore();
  let count = 0;

  try {
    // 1. Sync Members
    if (store.members.length > 0) {
      const memberPayload = store.members.map((m) => ({
        id: m.id,
        name: m.name,
        mobile: m.mobile,
        status: m.status,
        photo_url: m.photoUrl || null,
        organization_name: m.organizationName || 'ग्रामोदय यूथ मंच',
        father_name: m.fatherName || null,
        dob: m.dob || null,
        address: m.address || null,
        role: 'MEMBER',
        created_at: m.createdAt,
      }));
      const { error } = await supabase.from('members').upsert(memberPayload, { onConflict: 'id' });
      if (!error) count += memberPayload.length;
    }

    // 2. Sync Complaints
    if (store.complaints.length > 0) {
      const complaintPayload = store.complaints.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        description: c.description,
        location: c.location,
        reporter_name: c.reporterName,
        reporter_mobile: c.reporterMobile,
        status: c.status,
        photo_url: c.photoUrl || null,
        video_url: c.videoUrl || null,
        is_demo: c.isDemo || false,
        resolved_at: c.resolvedAt || null,
        created_at: c.createdAt,
      }));
      const { error } = await supabase.from('complaints').upsert(complaintPayload, { onConflict: 'id' });
      if (!error) count += complaintPayload.length;
    }

    // 3. Sync Announcements
    if (store.announcements.length > 0) {
      const annPayload = store.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        published_by: a.publishedBy,
        date: a.date,
        created_at: a.createdAt,
      }));
      const { error } = await supabase.from('announcements').upsert(annPayload, { onConflict: 'id' });
      if (!error) count += annPayload.length;
    }

    return { success: true, syncedCount: count };
  } catch (err: any) {
    return { success: false, syncedCount: count, error: err?.message || 'Sync failed' };
  }
}
