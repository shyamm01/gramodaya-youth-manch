import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction, normalizeMobile } from '@/src/lib/serverStore';
import { signJwtToken } from '@/src/lib/jwtAuth';
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

let sqlClient: postgres.Sql | null = null;

function getSqlClient() {
  if (sqlClient) return sqlClient;
  if (connectionString) {
    try {
      sqlClient = postgres(connectionString, {
        max: 5,
        prepare: false,
        ssl: { rejectUnauthorized: false },
      });
      return sqlClient;
    } catch (e) {
      console.warn('Postgres connection failed in members route:', e);
    }
  }
  return null;
}

export async function GET() {
  const store = loadStore();

  // Try fetching fresh data from PostgreSQL database
  try {
    const sql = getSqlClient();
    if (sql) {
      const dbMembers = await sql`
        SELECT 
          id, 
          name, 
          mobile, 
          photo_url as "photoUrl", 
          father_name as "fatherName", 
          dob, 
          gender,
          address, 
          village_id as "villageId",
          occupation,
          designation,
          political_background as "politicalBackground",
          blood_group as "bloodGroup",
          status, 
          role, 
          system_role as "systemRole", 
          organization_name as "organizationName", 
          created_at as "createdAt"
        FROM public.members 
        ORDER BY id DESC;
      `;

      if (dbMembers && dbMembers.length > 0) {
        // Map database records
        const mapped = dbMembers.map((m: any) => ({
          id: String(m.id),
          name: m.name,
          mobile: m.mobile,
          photoUrl: m.photoUrl || '',
          fatherName: m.fatherName || '',
          dob: m.dob || '',
          gender: m.gender || '',
          address: m.address || '',
          villageId: m.villageId ? String(m.villageId) : 'vil_rasoolpur',
          occupation: m.occupation || '',
          designation: m.designation || '',
          politicalBackground: m.politicalBackground || '',
          bloodGroup: m.bloodGroup || '',
          status: m.status || 'active',
          role: m.role || 'MEMBER',
          systemRole: m.systemRole || 'MEMBER',
          organizationName: m.organizationName || 'ग्रामोदय यूथ मंच',
          createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        }));

        // Sync with local store
        store.members = mapped;
        saveStore(store);

        return NextResponse.json({ success: true, members: mapped, source: 'database' });
      }
    }
  } catch (dbErr) {
    console.warn('Direct database fetch failed, serving from data_store:', dbErr);
  }

  return NextResponse.json({ success: true, members: store.members, source: 'store' });
}

export async function POST(req: Request) {
  try {
    const {
      name,
      mobile,
      photoUrl,
      fatherName,
      dob,
      gender,
      address,
      villageId,
      occupation,
      designation,
      politicalBackground,
      bloodGroup,
      status = 'pending',
      organizationName = 'ग्रामोदय यूथ मंच',
      adminName,
      adminMobile,
      createdAt,
    } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'कृपया सदस्य का पूरा नाम दर्ज करें।' }, { status: 400 });
    }

    const cleanMobileDigits = normalizeMobile(mobile || '');
    if (!cleanMobileDigits || cleanMobileDigits.length < 10) {
      return NextResponse.json({ error: 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' }, { status: 400 });
    }

    const formattedMobile = `+91 ${cleanMobileDigits.slice(0, 5)} ${cleanMobileDigits.slice(5)}`;
    const store = loadStore();

    // 1. Check local store duplicate
    const existingIndex = store.members.findIndex(
      (m) => normalizeMobile(m.mobile) === cleanMobileDigits
    );

    if (existingIndex >= 0) {
      const existing = store.members[existingIndex];
      const token = await signJwtToken({
        id: String(existing.id),
        name: existing.name,
        mobile: existing.mobile,
        role: existing.systemRole || existing.role || 'MEMBER',
        systemRole: existing.systemRole || existing.role || 'MEMBER',
        villageId: existing.villageId,
        isAdmin: false,
      });

      return NextResponse.json(
        {
          error: `यह मोबाइल नंबर (${formattedMobile}) पहले से पंजीकृत है [स्थिति: ${existing.status === 'active' ? 'सक्रिय' : 'लंबित'}]।`,
          alreadyRegistered: true,
          member: existing,
          token,
        },
        { status: 409 }
      );
    }

    const effectiveVillageId = villageId || (store.villages && store.villages[0] ? store.villages[0].id : 'vil_rasoolpur');
    const memberId = `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newMember = {
      id: memberId,
      villageId: effectiveVillageId,
      name: name.trim(),
      mobile: formattedMobile,
      photoUrl: photoUrl || '',
      fatherName: fatherName ? fatherName.trim() : '',
      dob: dob ? dob.trim() : '',
      gender: gender ? gender.trim() : '',
      address: address ? address.trim() : 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
      occupation: occupation ? occupation.trim() : '',
      designation: designation ? designation.trim() : '',
      politicalBackground: politicalBackground ? politicalBackground.trim() : '',
      bloodGroup: bloodGroup ? bloodGroup.trim() : '',
      status: (status === 'active' ? 'active' : 'pending') as 'active' | 'pending',
      role: 'MEMBER' as const,
      systemRole: 'MEMBER' as const,
      organizationName: organizationName || 'ग्रामोदय यूथ मंच',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    };

    // 2. Persist to PostgreSQL Database directly
    let dbPersisted = false;
    try {
      const sql = getSqlClient();
      if (sql) {
        // Resolve numeric villageId if available
        let numericVillageId: number | null = null;
        if (typeof effectiveVillageId === 'number') {
          numericVillageId = effectiveVillageId;
        } else if (!isNaN(Number(effectiveVillageId))) {
          numericVillageId = Number(effectiveVillageId);
        } else {
          // Look up from villages table
          const foundVillage = await sql`SELECT id FROM public.villages LIMIT 1;`;
          if (foundVillage && foundVillage.length > 0) {
            numericVillageId = foundVillage[0].id;
          }
        }

        const inserted = await sql`
          INSERT INTO public.members (
            village_id,
            name,
            mobile,
            status,
            photo_url,
            organization_name,
            father_name,
            dob,
            gender,
            address,
            occupation,
            designation,
            political_background,
            blood_group,
            role,
            system_role,
            created_at,
            updated_at
          ) VALUES (
            ${numericVillageId},
            ${newMember.name},
            ${newMember.mobile},
            ${newMember.status},
            ${newMember.photoUrl || null},
            ${newMember.organizationName},
            ${newMember.fatherName || null},
            ${newMember.dob || null},
            ${newMember.gender || null},
            ${newMember.address},
            ${newMember.occupation || null},
            ${newMember.designation || null},
            ${newMember.politicalBackground || null},
            ${newMember.bloodGroup || null},
            'MEMBER',
            'MEMBER',
            NOW(),
            NOW()
          )
          ON CONFLICT (mobile) DO UPDATE SET
            name = EXCLUDED.name,
            photo_url = EXCLUDED.photo_url,
            father_name = EXCLUDED.father_name,
            dob = EXCLUDED.dob,
            gender = EXCLUDED.gender,
            address = EXCLUDED.address,
            occupation = EXCLUDED.occupation,
            designation = EXCLUDED.designation,
            political_background = EXCLUDED.political_background,
            blood_group = EXCLUDED.blood_group,
            updated_at = NOW()
          RETURNING id;
        `;

        if (inserted && inserted.length > 0) {
          newMember.id = String(inserted[0].id);
          dbPersisted = true;
        }
      }
    } catch (dbError) {
      console.error('Postgres member insert error:', dbError);
    }

    // 3. Save to local fast store
    store.members.push(newMember);
    saveStore(store);

    // 4. Generate JWT Token for newly registered member
    const token = await signJwtToken({
      id: newMember.id,
      name: newMember.name,
      mobile: newMember.mobile,
      role: 'MEMBER',
      systemRole: 'MEMBER',
      villageId: newMember.villageId,
      isAdmin: false,
    });

    logAuditAction(
      `Registered Member (${newMember.name}) [Role: MEMBER, Database Persisted: ${dbPersisted}]`,
      adminName || 'Public Registration Portal',
      adminMobile || newMember.mobile,
      newMember.name
    );

    return NextResponse.json(
      {
        success: true,
        member: newMember,
        token,
        persistedInDatabase: dbPersisted,
        message: 'सदस्यता सफलतापूर्वक दर्ज हो गई है।',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'सदस्य पंजीकरण करने में त्रुटि हुई।' }, { status: 500 });
  }
}
