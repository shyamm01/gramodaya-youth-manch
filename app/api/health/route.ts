import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'Gramodaya Youth Manch - Rasoolpur',
    village: 'RASOOLPUR',
    gramPanchayat: 'BAHERA',
    timestamp: new Date().toISOString(),
  });
}
