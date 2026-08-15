import { NextResponse } from 'next/server';
import { uploadToSupabaseStorage } from '@/src/lib/supabaseStorage';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. Multipart Form Data Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const bucket = (formData.get('bucket') as string) || 'images';
      const folder = (formData.get('folder') as string) || 'uploads';
      const filename = formData.get('filename') as string | undefined;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided in form-data' }, { status: 400 });
      }

      const res = await uploadToSupabaseStorage(file, {
        bucket,
        folder,
        filename: filename || file.name,
        contentType: file.type || 'image/jpeg',
      });

      if (res.success && res.publicUrl) {
        return NextResponse.json({
          success: true,
          provider: 'supabase_storage',
          url: res.publicUrl,
          path: res.path,
        });
      }

      return NextResponse.json({ success: false, error: res.error || 'Upload failed' }, { status: 500 });
    }

    // 2. JSON Base64 Payload Upload
    const body = await req.json().catch(() => ({}));
    const { base64, bucket = 'images', folder = 'uploads', filename } = body;

    if (!base64) {
      return NextResponse.json({ success: false, error: 'Base64 data or file is required' }, { status: 400 });
    }

    // If it's already a hosted URL, return directly
    if (base64.startsWith('http://') || base64.startsWith('https://')) {
      return NextResponse.json({ success: true, url: base64, provider: 'direct_url' });
    }

    const res = await uploadToSupabaseStorage(base64, {
      bucket,
      folder,
      filename,
    });

    if (res.success && res.publicUrl) {
      return NextResponse.json({
        success: true,
        provider: 'supabase_storage',
        url: res.publicUrl,
        path: res.path,
      });
    }

    return NextResponse.json({ success: false, error: res.error || 'Upload failed' }, { status: 500 });
  } catch (error: any) {
    console.error('Error in /api/upload/supabase:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
