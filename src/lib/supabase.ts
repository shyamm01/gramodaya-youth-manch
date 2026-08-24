import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient as createSsrBrowserClient } from '@/lib/supabase/client';

// Retrieve credentials from Next.js environment variables defined in .env.local
const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yynnbfuinskyhdwjpnja.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_BHODlbLcF6uGs893x_r5dA_8c8bmxRr';

export const normalizeUrl = (rawUrl?: string | null): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin.endsWith('/') ? parsed.origin : parsed.href.replace(/\/$/, '');
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getValidSupabaseUrl = (): string => {
  try {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

    const envUrl = normalizeUrl(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      metaEnv.VITE_SUPABASE_URL ||
      metaEnv.SUPABASE_URL ||
      (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : undefined)
    );
    if (envUrl) return envUrl;

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUrl = normalizeUrl(
        window.localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') ||
        window.localStorage.getItem('VITE_SUPABASE_URL')
      );
      if (storedUrl) return storedUrl;
    }
  } catch (e) {
    // Fallback if URL parsing fails
  }
  return DEFAULT_SUPABASE_URL;
};

export const getValidSupabaseAnonKey = (): string => {
  try {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

    const rawKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.VITE_SUPABASE_ANON_KEY ||
      metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.SUPABASE_ANON_KEY ||
      (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY : undefined);

    if (typeof rawKey === 'string' && rawKey.trim().length > 0) {
      return rawKey.trim();
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedKey =
        window.localStorage.getItem('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
        window.localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
        window.localStorage.getItem('VITE_SUPABASE_ANON_KEY');
      if (storedKey && storedKey.trim().length > 0) {
        return storedKey.trim();
      }
    }
  } catch (e) {
    // Fallback if environment access fails
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

export let supabaseUrl: string = getValidSupabaseUrl();
export let supabaseAnonKey: string = getValidSupabaseAnonKey();

/**
 * True when the admin "point this app at another Supabase project" feature has
 * stored an override. Only then does this module build its own client.
 */
function hasCredentialOverride(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return Boolean(
    window.localStorage.getItem('VITE_SUPABASE_URL') ||
      window.localStorage.getItem('VITE_SUPABASE_ANON_KEY')
  );
}

/**
 * Builds the default client.
 *
 * In the browser this delegates to the cookie-backed @supabase/ssr singleton in
 * `lib/supabase/client.ts` so the app has exactly ONE GoTrueClient.
 *
 * It previously created a second `@supabase/supabase-js` client here with
 * persistSession + autoRefreshToken enabled. That client stored the session in
 * localStorage while the SSR client stored it in cookies, and both ran on the
 * same pages (live chat, admin helpdesk). Two GoTrueClients over one project
 * fight: whichever refreshed first rotated the refresh token and invalidated
 * the other's copy. The cookie copy is the one the server reads, so once it
 * went stale every server-side getUser() failed and /api/auth/me returned
 * {"authenticated": false} even though the browser still looked signed in.
 *
 * On the server this module is only used for anonymous reads, so it must never
 * persist or refresh a session.
 */
function createDefaultClient(): SupabaseClient {
  if (typeof window !== 'undefined' && !hasCredentialOverride()) {
    return createSsrBrowserClient() as unknown as SupabaseClient;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
    },
  });
}

let activeClient: SupabaseClient = createDefaultClient();

/**
 * Proxy export for `supabase` so all imports dynamically route to the single active client.
 * This guarantees no duplicate Supabase clients are created in the app.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = (activeClient as any)[prop];
    if (typeof value === 'function') {
      return value.bind(activeClient);
    }
    return value;
  },
});

/**
 * Updates the Supabase configuration, saves to localStorage, and re-initializes the active client.
 */
export const updateSupabaseCredentials = (url: string, key: string) => {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) {
    throw new Error('Supabase URL must be a valid HTTP or HTTPS URL (e.g. https://your-project.supabase.co)');
  }

  const cleanKey = key.trim();
  if (!cleanKey) {
    throw new Error('Supabase Publishable/Anon Key is required');
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('VITE_SUPABASE_URL', normalizedUrl);
    window.localStorage.setItem('VITE_SUPABASE_ANON_KEY', cleanKey);
  }

  supabaseUrl = normalizedUrl;
  supabaseAnonKey = cleanKey;

  activeClient = createClient(normalizedUrl, cleanKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return activeClient;
};

/**
 * Automatically tests connection to the Supabase project
 */
export const testSupabaseConnection = async (targetUrl?: string, targetKey?: string): Promise<{ success: boolean; message: string }> => {
  try {
    let clientToTest = activeClient;
    if (targetUrl && targetKey) {
      const validTargetUrl = normalizeUrl(targetUrl);
      if (!validTargetUrl) {
        return { success: false, message: 'Invalid Supabase URL format.' };
      }
      clientToTest = createClient(validTargetUrl, targetKey.trim(), {
        auth: { persistSession: false },
      });
    }

    // Ping Supabase Auth session service
    const { error: authErr } = await clientToTest.auth.getSession();
    if (authErr && !authErr.message.includes('Auth session missing')) {
      // If error is network or invalid host
      if (authErr.message.includes('FetchError') || authErr.message.includes('Failed to fetch')) {
        return { success: false, message: 'Network connection failed. Verify URL and internet connection.' };
      }
    }

    // Ping Supabase REST endpoint (or chat_rooms table check)
    const { error: dbErr } = await clientToTest.from('chat_rooms').select('id', { head: true, count: 'exact' });
    if (dbErr) {
      // 401 or Invalid API Key
      if (dbErr.code === 'PGRST301' || dbErr.message.includes('apikey') || dbErr.message.includes('JWT')) {
        return { success: false, message: 'Invalid Supabase Publishable/Anon Key.' };
      }
    }

    return { success: true, message: 'Connection established successfully.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed.' };
  }
};

/**
 * Phone OTP Authentication via Supabase Auth client
 */
export const signInWithPhoneOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
  return await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });
};

export const verifyPhoneOtp = async (phone: string, token: string) => {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
  return await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });
};

/**
 * Send Email OTP via Supabase Auth client
 */
export const sendEmailOtp = async (email: string) => {
  const cleanEmail = email.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { data: null, error: new Error('Please enter a valid email address.') };
  }

  try {
    const res = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (res.error) {
      const msg = res.error.message || '';
      if (msg.toLowerCase().includes('confirmation email') || msg.toLowerCase().includes('error sending')) {
        return {
          data: null,
          error: new Error(
            'Supabase Mailer Error: Supabase requires Custom SMTP configured in your Supabase Dashboard to deliver OTP emails. Please use Mobile OTP or Password login for instant access.'
          ),
        };
      }
    }

    return res;
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('confirmation email') || msg.toLowerCase().includes('error sending')) {
      return {
        data: null,
        error: new Error(
          'Supabase Mailer Error: Supabase requires Custom SMTP configured in your Supabase Dashboard to deliver OTP emails. Please use Mobile OTP or Password login for instant access.'
        ),
      };
    }
    return { data: null, error: err instanceof Error ? err : new Error(err?.message || 'Failed to send OTP') };
  }
};

/**
 * Verify Email OTP via Supabase Auth client
 */
export const verifyEmailOtp = async (email: string, token: string) => {
  const cleanEmail = email.trim();
  const cleanToken = token.trim();

  if (!cleanToken) {
    return { data: null, error: new Error('Invalid OTP. Please check the code and try again.') };
  }

  try {
    // Try type: 'email' first
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    // If type mismatch or signup token, try type 'signup'
    if (error && (
      error.message.toLowerCase().includes('signup') ||
      error.message.toLowerCase().includes('type')
    )) {
      const signupRes = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup',
      });
      if (!signupRes.error) {
        data = signupRes.data;
        error = null;
      }
    }

    return { data, error };
  } catch (err: any) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(err?.message || 'Verification failed'),
    };
  }
};

/**
 * Invoke Supabase Edge Function: send-otp
 */
export const invokeSendOtpEdgeFunction = async (mobile: string, role = 'MEMBER') => {
  try {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { mobile, role },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase Edge Function send-otp fallback:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Invoke Supabase Edge Function: verify-otp
 */
export const invokeVerifyOtpEdgeFunction = async (mobile: string, otp: string, name?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { mobile, otp, name },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase Edge Function verify-otp fallback:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sign in / Sign up via OAuth Provider (Google, Facebook, GitHub)
 */
export const signInWithOAuthProvider = async (provider: 'google' | 'facebook' | 'github') => {
  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error(`OAuth login error (${provider}):`, err.message);
    return { success: false, error: err.message };
  }
};




