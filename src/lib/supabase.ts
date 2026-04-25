import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY არ არის გასწერილი. ' +
    'აპი მუშაობს localStorage-ით. დააკოპირე .env.example .env.local-ად და შეავსე.'
  );
}

let anonAuthPromise: Promise<string | null> | null = null;

/**
 * აბრუნებს მიმდინარე user_id-ს. თუ session არაა, ანონიმურად შემოვა.
 * იყენებს Supabase Anonymous Sign-Ins-ს — Dashboard-ში ჩართე:
 * Authentication → Providers → Anonymous Sign-Ins → Enable.
 */
export async function ensureAnonAuth(): Promise<string | null> {
  if (!supabase) return null;
  if (anonAuthPromise) return anonAuthPromise;

  anonAuthPromise = (async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user.id) return sessionData.session.user.id;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('[supabase] anon sign-in failed:', error.message);
      anonAuthPromise = null;
      return null;
    }
    return data.user?.id ?? null;
  })();

  return anonAuthPromise;
}
