/**
 * Client-Side API Helper: Automatically includes credentials (cookies) and Authorization Bearer JWT header
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});

  // 1. Ensure JSON content-type if not specified and body is present
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // 2. Attach Authorization Bearer token from localStorage if available
  if (typeof window !== 'undefined' && !headers.has('Authorization') && !headers.has('authorization')) {
    const token = localStorage.getItem('gym_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include', // Automatically send and receive HTTP-Only cookies
  });
}
