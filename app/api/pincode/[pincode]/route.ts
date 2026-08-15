import { NextResponse } from 'next/server';

// In-memory cache for fast pincode lookups
const pincodeCache = new Map<string, any>();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await params;
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');

    if (!cleanPin || cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'कृपया वैध 6-अंकीय पिनकोड दर्ज करें।' },
        { status: 400 }
      );
    }

    if (pincodeCache.has(cleanPin)) {
      return NextResponse.json({
        success: true,
        ...pincodeCache.get(cleanPin),
        cached: true,
      });
    }

    // Query India Postal Pincode Public API
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      headers: {
        'User-Agent': 'GramodayaYouthManch-PincodeLookup/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'पिनकोड डेटा फेच करने में विफल।' },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || !data[0] || data[0].Status !== 'Success' || !data[0].PostOffice?.length) {
      return NextResponse.json(
        { success: false, error: 'यह पिनकोड डाक विभाग के रिकॉर्ड में नहीं मिला।' },
        { status: 404 }
      );
    }

    const postOffices = data[0].PostOffice;
    const firstPO = postOffices[0];

    const result = {
      pincode: cleanPin,
      district: firstPO.District || '',
      state: firstPO.State || '',
      block: firstPO.Block || firstPO.Taluk || '',
      division: firstPO.Division || '',
      circle: firstPO.Circle || '',
      country: firstPO.Country || 'India',
      postOffices: postOffices.map((po: any) => ({
        name: po.Name,
        branchType: po.BranchType,
        deliveryStatus: po.DeliveryStatus,
        circle: po.Circle,
        district: po.District,
        division: po.Division,
        region: po.Region,
        block: po.Block,
        state: po.State,
      })),
    };

    pincodeCache.set(cleanPin, result);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Pincode lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'पिनकोड सर्वर से जुड़ने में त्रुटि।' },
      { status: 500 }
    );
  }
}
