import { NextResponse } from 'next/server';

/**
 * @deprecated /api/data has been removed in favor of domain-driven REST endpoints:
 * - /api/auth/me (for session, profile & user permissions)
 * - /api/villages (for village chapters and settings)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    deprecated: true,
    message: 'This endpoint is deprecated. Use /api/auth/me and /api/villages instead.',
  });
}
