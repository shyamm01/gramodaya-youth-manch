import { NextResponse } from 'next/server';
import { uploadToSupabaseStorage, getSupabaseS3Client } from '@/src/lib/supabaseStorage';
import { ListBucketsCommand } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    const s3 = getSupabaseS3Client();
    const bucketsRes = await s3.send(new ListBucketsCommand({}));

    return NextResponse.json({
      success: true,
      endpoint: process.env.SUPABASE_S3_ENDPOINT,
      buckets: bucketsRes.Buckets?.map((b) => b.Name) || [],
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#059669"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-size="12" font-family="sans-serif">Supabase S3 OK</text></svg>`;
    const base64 = `data:image/svg+xml;base64,${Buffer.from(testSvg).toString('base64')}`;

    const res = await uploadToSupabaseStorage(base64, {
      bucket: 'member-photos',
      folder: 'system_test',
      filename: `test_${Date.now()}.svg`,
      contentType: 'image/svg+xml',
    });

    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
