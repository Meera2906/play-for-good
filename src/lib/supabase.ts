import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '') {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase URL or Anon Key is missing or empty.');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!client) {
      const msg = 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Settings menu.';
      console.error(msg);
      // Return a dummy function for common calls to avoid immediate crashes in some contexts,
      // but throw for actual data operations.
      if (prop === 'auth' || prop === 'from') {
        throw new Error(msg);
      }
      return undefined;
    }
    return (client as any)[prop];
  }
});
