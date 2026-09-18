import { createClient } from '@supabase/supabase-js'

function formatSupabaseUrl(url: string | undefined): string {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

const rawUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.SUPABASE_URL as string) ||
  '';

const supabaseUrl = formatSupabaseUrl(rawUrl);

const supabaseAnonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_KEY as string) ||
  ''
).trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ [DailySet] Variables de entorno de Supabase no encontradas. Asegúrate de configurar SUPABASE_URL y SUPABASE_ANON_KEY (o VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).'
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'dailyset-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
