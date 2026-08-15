import { NextResponse } from 'next/server';
import { getSqlClient, normalizeMobile, hashPassword, logAuditAction } from '@/src/lib/authUtils';
import { signJwtToken, setAuthCookie } from '@/src/lib/jwtAuth';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ success: true, members: [] });
    }

    // Auto-ensure schema columns if not yet applied
    try {
      await sql`
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '241125';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Uttar Pradesh';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Hardoi';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS block TEXT DEFAULT 'Hardoi';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS gram_panchayat TEXT DEFAULT 'Bahera';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS village_name TEXT DEFAULT 'Rasoolpur';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS post_office TEXT DEFAULT 'Bahera Rasoolpur';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS house_no TEXT;
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS street TEXT;
      `;
    } catch (migErr) {
      // Ignored if permissions are restricted
    }

    const dbMembers = await sql`SELECT * FROM public.members ORDER BY id DESC;`;

    const formatted = dbMembers.map((m: any) => ({
      id: String(m.id),
      villageId: m.village_id ? String(m.village_id) : 'vil_rasoolpur',
      name: m.name,
      mobile: m.mobile,
      email: m.email || '',
      photoUrl: m.photo_url || '',
      fatherName: m.father_name || '',
      dob: m.dob || '',
      gender: m.gender || '',
      address: m.address || 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
      pincode: m.pincode || '241125',
      state: m.state || 'Uttar Pradesh',
      district: m.district || 'Hardoi',
      block: m.block || 'Hardoi',
      gramPanchayat: m.gram_panchayat || 'Bahera',
      villageName: m.village_name || 'Rasoolpur',
      postOffice: m.post_office || 'Bahera Rasoolpur',
      houseNo: m.house_no || '',
      street: m.street || '',
      occupation: m.occupation || '',
      designation: m.designation || '',
      politicalBackground: m.political_background || '',
      bloodGroup: m.blood_group || '',
      status: m.status || 'active',
      role: m.role || 'MEMBER',
      systemRole: m.system_role || 'MEMBER',
      organizationName: m.organization_name || 'ग्रामोदय यूथ मंच',
      createdAt: m.created_at,
    }));

    return NextResponse.json({
      success: true,
      members: formatted,
      source: 'postgres',
    });
  } catch (error: any) {
    console.error('Error fetching members from DB:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
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
      email,
      password,
      address,
      pincode,
      state,
      district,
      block,
      gramPanchayat,
      villageName,
      postOffice,
      houseNo,
      street,
      villageId,
      occupation,
      designation,
      politicalBackground,
      bloodGroup,
      status = 'active',
      organizationName = 'ग्रामोदय यूथ मंच',
    } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'कृपया सदस्य का पूरा नाम दर्ज करें।' }, { status: 400 });
    }

    const cleanMobileDigits = normalizeMobile(mobile || '');
    if (!cleanMobileDigits || cleanMobileDigits.length < 10) {
      return NextResponse.json({ error: 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' }, { status: 400 });
    }

    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ error: 'डेटाबेस कनेक्शन अनुपलब्ध है।' }, { status: 500 });
    }

    const formattedMobile = `+91 ${cleanMobileDigits.slice(0, 5)} ${cleanMobileDigits.slice(5)}`;
    const passwordHash = password ? hashPassword(password) : null;

    // Check duplicate in PostgreSQL
    const existing = await sql`
      SELECT id, name, mobile, email, status, role, system_role, village_id 
      FROM public.members 
      WHERE mobile LIKE ${`%${cleanMobileDigits}%`}
      LIMIT 1;
    `;

    if (existing && existing.length > 0) {
      const ex = existing[0];
      const token = await signJwtToken({
        id: String(ex.id),
        name: ex.name,
        mobile: ex.mobile,
        email: ex.email,
        role: ex.system_role || ex.role || 'MEMBER',
        systemRole: ex.system_role || ex.role || 'MEMBER',
        villageId: ex.village_id ? String(ex.village_id) : 'vil_rasoolpur',
        isAdmin: false,
      });

      return NextResponse.json(
        {
          error: `यह मोबाइल नंबर (${formattedMobile}) पहले से पंजीकृत है [स्थिति: ${ex.status === 'active' ? 'सक्रिय' : 'लंबित'}]।`,
          alreadyRegistered: true,
          member: ex,
          token,
        },
        { status: 409 }
      );
    }

    // Resolve village ID
    let numericVillageId: number | null = null;
    if (villageId && !isNaN(Number(villageId))) {
      numericVillageId = Number(villageId);
    } else {
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
        email,
        password_hash,
        status,
        photo_url,
        organization_name,
        father_name,
        dob,
        gender,
        address,
        pincode,
        state,
        district,
        block,
        gram_panchayat,
        village_name,
        post_office,
        house_no,
        street,
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
        ${name.trim()},
        ${formattedMobile},
        ${email ? email.trim() : null},
        ${passwordHash},
        ${status as any},
        ${photoUrl || null},
        ${organizationName},
        ${fatherName ? fatherName.trim() : null},
        ${dob ? dob.trim() : null},
        ${gender ? gender.trim() : null},
        ${address ? address.trim() : 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा'},
        ${pincode ? pincode.trim() : '222139'},
        ${state ? state.trim() : 'Uttar Pradesh'},
        ${district ? district.trim() : 'Jaunpur'},
        ${block ? block.trim() : 'Shahganj'},
        ${gramPanchayat ? gramPanchayat.trim() : 'Bahera'},
        ${villageName ? villageName.trim() : 'Rasoolpur'},
        ${postOffice ? postOffice.trim() : 'Rasulpur'},
        ${houseNo ? houseNo.trim() : null},
        ${street ? street.trim() : null},
        ${occupation ? occupation.trim() : null},
        ${designation ? designation.trim() : null},
        ${politicalBackground ? politicalBackground.trim() : null},
        ${bloodGroup ? bloodGroup.trim() : null},
        'MEMBER',
        'MEMBER',
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newMemberRecord = inserted[0];
    const newMember = {
      id: String(newMemberRecord.id),
      villageId: newMemberRecord.village_id ? String(newMemberRecord.village_id) : 'vil_rasoolpur',
      name: newMemberRecord.name,
      mobile: newMemberRecord.mobile,
      email: newMemberRecord.email || '',
      photoUrl: newMemberRecord.photo_url || '',
      fatherName: newMemberRecord.father_name || '',
      dob: newMemberRecord.dob || '',
      gender: newMemberRecord.gender || '',
      address: newMemberRecord.address || '',
      occupation: newMemberRecord.occupation || '',
      designation: newMemberRecord.designation || '',
      politicalBackground: newMemberRecord.political_background || '',
      bloodGroup: newMemberRecord.blood_group || '',
      status: newMemberRecord.status || 'active',
      role: newMemberRecord.role || 'MEMBER',
      systemRole: newMemberRecord.system_role || 'MEMBER',
      organizationName: newMemberRecord.organization_name || 'ग्रामोदय यूथ मंच',
      createdAt: newMemberRecord.created_at,
    };

    const token = await signJwtToken({
      id: newMember.id,
      name: newMember.name,
      mobile: newMember.mobile,
      email: newMember.email,
      role: 'MEMBER',
      systemRole: 'MEMBER',
      villageId: newMember.villageId,
      isAdmin: false,
    });

    logAuditAction(
      `Registered Member (${newMember.name}) [Role: MEMBER]`,
      'Public Registration Portal',
      newMember.mobile,
      newMember.name
    );

    const response = NextResponse.json(
      {
        success: true,
        member: newMember,
        token,
        message: 'सदस्यता सफलतापूर्वक दर्ज हो गई है।',
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Error adding member to Postgres:', error);
    return NextResponse.json(
      { error: error.message || 'सदस्य जोड़ने में त्रुटि हुई।' },
      { status: 500 }
    );
  }
}
