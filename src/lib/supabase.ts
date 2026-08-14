import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials directly from Vite environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
const DEFAULT_SUPABASE_URL = 'https://yynnbfuinskyhdwjpnja.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_BHODlbLcF6uGs893x_r5dA_8c8bmxRr';

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
    const metaEnv = (import.meta as any).env || {};
    const procEnv: Record<string, any> = typeof process !== 'undefined' && process.env ? process.env : {};

    const envUrl = normalizeUrl(
      metaEnv.VITE_SUPABASE_URL ||
      metaEnv.SUPABASE_URL ||
      procEnv.VITE_SUPABASE_URL ||
      procEnv.SUPABASE_URL ||
      procEnv.NEXT_PUBLIC_SUPABASE_URL
    );
    if (envUrl) return envUrl;

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUrl = normalizeUrl(window.localStorage.getItem('VITE_SUPABASE_URL'));
      if (storedUrl) return storedUrl;
    }
  } catch (e) {
    // Fallback if URL parsing fails
  }
  return DEFAULT_SUPABASE_URL;
};

export const getValidSupabaseAnonKey = (): string => {
  try {
    const metaEnv = (import.meta as any).env || {};
    const procEnv: Record<string, any> = typeof process !== 'undefined' && process.env ? process.env : {};

    const rawKey =
      metaEnv.VITE_SUPABASE_ANON_KEY ||
      metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.SUPABASE_ANON_KEY ||
      procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      procEnv.VITE_SUPABASE_ANON_KEY ||
      procEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
      procEnv.SUPABASE_PUBLISHABLE_KEY ||
      procEnv.SUPABASE_ANON_KEY;

    if (typeof rawKey === 'string' && rawKey.trim().length > 0) {
      return rawKey.trim();
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedKey = window.localStorage.getItem('VITE_SUPABASE_ANON_KEY');
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

let activeClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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




