import { NextResponse } from 'next/server';
import { EducationError } from './service';

/**
 * Maps a thrown error onto the { success, error } envelope the rest of the API
 * uses. EducationError carries its own status (404/409/503); anything else is
 * an unexpected failure and reports as 500.
 */
export function educationErrorResponse(err: any, fallbackMessage: string) {
  if (err instanceof EducationError) {
    return NextResponse.json({ success: false, error: err.message }, { status: err.status });
  }
  // Unexpected failures (driver errors and the like) are logged in full but
  // reported generically — a raw query dump in the response body helps nobody
  // and exposes the schema.
  console.error(`${fallbackMessage}:`, err);
  return NextResponse.json({ success: false, error: fallbackMessage }, { status: 500 });
}
