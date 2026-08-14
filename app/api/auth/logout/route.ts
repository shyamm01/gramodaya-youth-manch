import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/src/lib/jwtAuth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'लॉगआउट सफल (Logged out successfully)',
  });
  clearAuthCookie(response);
  return response;
}
